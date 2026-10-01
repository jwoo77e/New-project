#!/usr/bin/env ruby
require "csv"
require "json"
require "date"
require "bigdecimal"
require "optparse"
require "time"

options = { "data-dir" => File.expand_path("../src/data", __dir__), "spend" => [], "code" => [], "previous-code" => [] }
OptionParser.new do |parser|
  %w[data-dir spend previous-code code month week-key].each do |key|
    parser.on("--#{key} VALUE") { |value| options[key].is_a?(Array) ? options[key] << value : options[key] = value }
  end
end.parse!
%w[spend previous-code code month week-key].each { |key| abort "Missing --#{key}" if options[key].nil? || options[key].empty? }

def source_label(path)
  parent = File.basename(File.dirname(path)).unicode_normalize(:nfc)
  parent == "클로드사용현황파일" ? File.basename(path) : "#{parent}/#{File.basename(path)}"
end

labels = %w[spend previous-code code].to_h { |key| [key, options.fetch(key).map { |path| source_label(path) }.join(" + ")] }
month = options.fetch("month")
first = Date.iso8601("#{month}-01")
last = first.next_month - 1
full_period = "#{first} ~ #{last}"
numeric = %w[requests promptTokens completionTokens totalTokens netSpendUsd]
paths = %w[individualMonthlySpendSnapshot individualWeeklyUsageSnapshot individualUtilizationSnapshot].map { |name| File.join(options.fetch("data-dir"), "#{name}.json") }
originals = paths.map { |path| File.read(path) }
monthly, weekly, utilization = originals.map { |source| JSON.parse(source) }
target = monthly.fetch("months").find { |item| item.fetch("month") == month }
abort "Existing monthly baseline required" unless target
code_source = utilization.dig("source", "codeLines").find { |item| item.fetch("month") == month }
abort "Existing code baseline required" unless code_source

# Keep the disjoint original components and code baseline immutable on reimport.
baseline_meta = target["monthClose"] || {
  "baselinePeriod" => target.fetch("period"),
  "baselineSpendFile" => target.fetch("fileName"),
  "baselineSpendRows" => target.fetch("rowCount"),
  "baselineCodeSource" => code_source.dup,
  "baselineCodeUsers" => utilization.fetch("users").select { |u| u.fetch("monthlyCodeLines").key?(month) }.to_h { |u| [u.fetch("email"), u.fetch("monthlyCodeLines").fetch(month)] },
}
components = target.fetch("components")
baseline_first, baseline_last = baseline_meta.fetch("baselinePeriod").split(" ~ ").map { |date| Date.iso8601(date) }
days = components.flat_map { |c| a, b = c.fetch("period").split(" ~ ").map { |d| Date.iso8601(d) }; (a..b).to_a }.sort
abort "Baseline must cover month start without gaps or overlaps" unless baseline_first == first && days == (first..baseline_last).to_a && baseline_last < last
abort "Code and spend baseline periods differ" unless baseline_meta.dig("baselineCodeSource", "period") == baseline_meta.fetch("baselinePeriod")
# Preserve explicitly partial account baselines before replacing their monthly rows.
# An absent row in a complete team export may mean zero usage; an uncollected
# personal-account period must never become zero just because the month closed.
baseline_meta["partialSpendBaselines"] ||= target.fetch("users").select do |_, usage|
  usage["coverage"] == "partial" && usage["sourcePeriod"] && usage["sourcePeriod"] != baseline_meta.fetch("baselinePeriod")
end.transform_values { |usage| usage.fetch("sourcePeriod") }
baseline = {}
components.each do |component|
  component.fetch("users").each do |email, usage|
    baseline[email] ||= numeric.to_h { |key| [key, 0] }.merge("products" => [], "models" => [])
    numeric.each { |key| baseline[email][key] += usage.fetch(key) }
    %w[products models].each { |key| baseline[email][key] |= usage.fetch(key) }
  end
end
baseline.each_value do |usage|
  usage["netSpendUsd"] = usage.fetch("netSpendUsd").round(6)
  %w[products models].each { |key| usage[key].sort! }
end

fields = { "requests" => "total_requests", "promptTokens" => "total_prompt_tokens", "completionTokens" => "total_completion_tokens", "netSpendUsd" => "total_net_spend_usd" }
current = {}
spend_exports = []
options.fetch("spend").each do |path|
  rows = CSV.read(path, headers: true, encoding: "bom|utf-8")
  abort "Invalid spend columns" unless (["user_email", "product", "model"] + fields.values).all? { |key| rows.headers.include?(key) }
  emails = rows.map { |row| row.fetch("user_email").strip.downcase }.uniq
  abort "Duplicate spend account across sources" unless (emails & current.keys).empty?
  spend_exports << { "fileName" => source_label(path), "rowCount" => rows.size, "accounts" => emails.sort }
  rows.each do |row|
    email = row.fetch("user_email").strip.downcase
    abort "Missing spend account" if email.empty?
    current[email] ||= numeric.to_h { |key| [key, 0] }.merge("products" => [], "models" => [])
    fields.each do |key, field|
      value = key == "netSpendUsd" ? BigDecimal(row.fetch(field).delete(",")) : Integer(row.fetch(field).delete(","))
      abort "Negative source usage for #{email}" if value < 0
      current[email][key] += value
    end
    { "products" => "product", "models" => "model" }.each { |key, field| current[email][key] |= [row.fetch(field)] }
  end
end
spend_row_count = spend_exports.sum { |source| source.fetch("rowCount") }
current.each_value do |usage|
  usage["totalTokens"] = usage.fetch("promptTokens") + usage.fetch("completionTokens")
  usage["netSpendUsd"] = usage.fetch("netSpendUsd").round(6).to_f
  %w[products models].each { |key| usage[key].sort! }
end
abort "Empty monthly spend export" if current.empty?
already_closed = target.fetch("users").select { |_, usage| usage["coverage"] == "complete" }.keys
abort "Reimport must include previously reconciled accounts; pass all monthly sources together" unless (already_closed - current.keys).empty?
def read_code(paths)
  output = {}
  paths.each do |path|
    rows = CSV.read(path, headers: true, encoding: "bom|utf-8")
    abort "Invalid code columns" unless ["User", "Lines this Month"].all? { |key| rows.headers.include?(key) }
    rows.each do |row|
      email = row.fetch("User").strip.downcase
      abort "Missing or duplicate code account" if email.empty? || output.key?(email)
      output[email] = Integer(row.fetch("Lines this Month").delete(","))
      abort "Negative source code usage" if output[email] < 0
    end
  end
  output
end
code = read_code(options.fetch("code"))
previous_code = read_code(options.fetch("previous-code"))
abort "Code accounts missing from spend export" unless (code.keys - current.keys).empty?
known = utilization.fetch("users").map { |user| user.fetch("email") }
abort "Unmapped accounts require roster reconciliation" unless (current.keys - known).empty?
old_code = baseline_meta.fetch("baselineCodeUsers")
abort "Attached previous code differs from the saved baseline" unless previous_code.all? { |email, lines| old_code[email] == lines }
abort "Previous code export is missing baseline accounts in the new report" unless ((old_code.keys & code.keys) - previous_code.keys).empty?
baseline_meta["previousCodeExport"] = { "fileName" => labels.fetch("previous-code"), "rowCount" => previous_code.size, "totalLines" => previous_code.values.sum }
baseline_meta["spendExports"] = spend_exports
abort "Spend account lost its code source" unless ((old_code.keys & current.keys) - code.keys).empty?
week_users = current.sort.to_h.transform_values(&:dup)
unallocated_usage = {}
week_users.each do |email, usage|
  numeric.each do |key|
    usage[key] = (usage.fetch(key) - baseline.fetch(email, {}).fetch(key, 0)).round(6)
    abort "Negative #{key} remainder for #{email}" if key != "netSpendUsd" && usage[key] < 0
  end
  usage["codeLines"] = code.fetch(email, 0) - previous_code.fetch(email, 0)
  abort "Negative code remainder for #{email}" if usage.fetch("codeLines") < 0
  usage["coverage"] = "complete"
  if (known_period = baseline_meta.fetch("partialSpendBaselines")[email])
    abort "Separate code allocation required for partial spend baseline: #{email}" if usage.fetch("codeLines") != 0
    known_first, known_last = known_period.split(" ~ ").map { |date| Date.iso8601(date) }
    abort "Invalid partial baseline for #{email}" unless first <= known_first && known_first <= known_last && known_last <= baseline_last
    remaining_periods = []
    remaining_periods << "#{first} ~ #{known_first - 1}" if known_first > first
    remaining_periods << "#{known_last + 1} ~ #{last}"
    unallocated_usage[email] = numeric.to_h { |key| [key, usage.fetch(key)] }.merge(
      "baselinePeriod" => known_period, "periods" => remaining_periods,
      "reason" => "incomplete_spend_baseline")
  end
end
week_users.reject! { |email, _| unallocated_usage.key?(email) }
preserved = baseline.keys - current.keys
users = baseline.select { |email, _| preserved.include?(email) }.transform_values(&:dup)
users.each do |email, usage|
  dates = components.select { |c| c.fetch("users").key?(email) }.flat_map { |c| c.fetch("period").split(" ~ ") }
  usage["sourcePeriod"] = "#{dates.min} ~ #{dates.max}"
  usage["coverage"] = "partial"
end
current.each { |email, usage| users[email] = usage.merge("sourcePeriod" => full_period, "coverage" => "complete") }
totals = ->(items, keys) { keys.to_h { |key| [key, items.sum { |u| u.fetch(key) }.round(6)] } }
target.merge!("users" => users.sort.to_h, "totals" => totals.call(users.values, numeric),
  "period" => full_period, "coverage" => preserved.empty? ? "complete" : "partial",
  "fileName" => labels.fetch("spend"), "rowCount" => spend_row_count,
  "preservedAccounts" => preserved.sort,
  "notes" => ["월간 파일에 포함된 계정은 전체 월 수치로 교체했습니다. components는 차액 계산용 이전 원천이며 현재 월 합계에 다시 더하지 않습니다.", "이번 파일에 없는 별도 계정 #{preserved.size}명은 기존 자료와 집계 기간을 유지했습니다."],
  "monthClose" => baseline_meta.merge("method" => "replace_exported_accounts_preserve_other_sources", "exportedAccounts" => current.size, "exportedTotals" => totals.call(current.values, numeric)))

period = {
  "key" => options.fetch("week-key"), "label" => "#{first.month}월 #{options.fetch('week-key').split('W').last}주차",
  "startDate" => (baseline_last + 1).to_s, "endDate" => last.to_s,
  "coverage" => preserved.empty? && unallocated_usage.empty? ? "complete" : "partial",
  "source" => {
    "previousSpendFile" => baseline_meta.fetch("baselineSpendFile"), "currentSpendFile" => labels.fetch("spend"),
    "previousSpendRows" => baseline_meta.fetch("baselineSpendRows"), "currentSpendRows" => spend_row_count,
    "previousCodeFile" => labels.fetch("previous-code"), "currentCodeFile" => labels.fetch("code"),
    "codePeriod" => "#{baseline_last + 1} ~ #{last}",
    "spendMethod" => "current_cumulative_minus_previous_cumulative", "codeMethod" => "current_cumulative_minus_previous_cumulative",
  },
  "totals" => totals.call(week_users.values, numeric + ["codeLines"]).merge("activeUsers" => week_users.values.count { |u| u.fetch("totalTokens") > 0 || u.fetch("codeLines") > 0 }),
  "users" => week_users,
  "unallocatedUsage" => unallocated_usage,
  "notes" => ["Claude 월간 파일에서 #{baseline_meta.fetch('baselinePeriod')} 누적값을 뺀 차액입니다.",
    "월간 파일에 없는 별도 #{preserved.size}계정의 이번 주 사용량은 미수집입니다.",
    "이전 집계 기간이 부족한 #{unallocated_usage.size}계정의 월간 차액은 unallocatedUsage에 보관하고 주차 합계에서 제외했습니다.",
    "이전 전체 보고서에 행이 없는 계정은 누적 사용량 0을 기준으로 계산하되, 별도 계정의 미수집 기간에는 적용하지 않습니다.",
    "순비용 차액에는 원천 보고서 반올림에 따른 음수 센트 보정이 포함될 수 있습니다."],
}
weekly["periods"] = (weekly.fetch("periods").reject { |p| p.fetch("key") == options.fetch("week-key") } + [period]).sort_by { |p| p.fetch("startDate") }
utilization.fetch("users").each { |u| u.fetch("monthlyCodeLines")[month] = code.fetch(u.fetch("email")) if code.key?(u.fetch("email")) }
preserved_code = old_code.keys - code.keys
code_source.merge!("fileName" => labels.fetch("code"), "period" => full_period,
  "rowCount" => code.size + preserved_code.size, "exportedRowCount" => code.size, "exportedTotalLines" => code.values.sum,
  "totalLines" => code.values.sum + preserved_code.sum { |email| old_code.fetch(email) },
  "preservedAccounts" => preserved_code.sort.map { |email| { "email" => email, "period" => baseline_meta.dig("baselineCodeSource", "period"), "codeLines" => old_code.fetch(email), "fileName" => baseline_meta.dig("baselineCodeSource", "fileName") } })
utilization["totals"]["codeLines"] = utilization.dig("source", "codeLines").sum { |source| source.fetch("totalLines") }
# All validation precedes writes. No timestamp churn: repeated imports are byte-identical.
[monthly, weekly, utilization].zip(paths, originals).each do |data, path, original|
  next if JSON.pretty_generate(data) + "\n" == original
  data["generatedAt"] = Time.now.getlocal("+09:00").iso8601 if data.key?("generatedAt")
  File.write(path, JSON.pretty_generate(data) + "\n")
end
puts JSON.pretty_generate({ "exportedAccounts" => current.size, "preservedAccounts" => preserved.sort, "unallocatedAccounts" => unallocated_usage.keys, "monthlyTotals" => target.fetch("totals"), "monthlyCodeLines" => code_source.fetch("totalLines"), "week" => period.fetch("totals") })
