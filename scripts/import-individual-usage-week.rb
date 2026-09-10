#!/usr/bin/env ruby
require "csv"
require "date"
require "json"
require "optparse"
require "tmpdir"
require "time"

options = {"spend" => [], "previous-code" => [], "code" => []}
OptionParser.new do |parser|
  %w[key label start end spend previous-code code].each do |key|
    parser.on("--#{key} VALUE") { |value| options[key].is_a?(Array) ? options[key] << value : options[key] = value }
  end
end.parse!
%w[key label start end spend previous-code code].each { |key| abort "Missing --#{key}" if options[key].nil? || options[key].empty? }
month = options.fetch("start")[0, 7]
abort "Monthly merge requires a week within one month" unless options.fetch("end")[0, 7] == month
root = File.expand_path("..", __dir__)
paths = %w[individualWeeklyUsageSnapshot individualMonthlySpendSnapshot individualUtilizationSnapshot].map do |name|
  File.join(root, "src/data", "#{name}.json")
end
weekly, monthly, utilization = paths.map { |path| JSON.parse(File.read(path)) }
numeric = %w[requests promptTokens completionTokens totalTokens netSpendUsd]
now = Time.now.getlocal("+09:00").iso8601

def code_rows(paths)
  output = {}
  paths.each do |path|
    rows = CSV.read(path, headers: true)
    abort "Invalid code CSV headers" unless %w[User Lines\ this\ Month].all? { |key| rows.headers.include?(key) }
    rows.each do |row|
      email = row.fetch("User").strip.downcase
      abort "Duplicate code account across sources: #{email}" if output.key?(email)
      output[email] = Integer(row.fetch("Lines this Month").delete(","))
    end
  end
  output
end

previous_code = code_rows(options.fetch("previous-code"))
current_code = code_rows(options.fetch("code"))
abort "Previous code accounts missing from current snapshot" unless (previous_code.keys - current_code.keys).empty?
abort "Negative code delta requires review" if current_code.any? { |email, count| count < previous_code.fetch(email, 0) }

Dir.mktmpdir("individual-usage-week") do |directory|
  temporary_week = File.join(directory, "weekly.json")
  File.write(temporary_week, JSON.generate(weekly))
  command = ["ruby", File.join(__dir__, "build-individual-weekly-usage-snapshot.rb"),
    "--key", options.fetch("key"), "--label", options.fetch("label"),
    "--start", options.fetch("start"), "--end", options.fetch("end"),
    "--spend-mode", "period",
    "--code-period", "#{options.fetch('start')} ~ #{options.fetch('end')}", "--output", temporary_week]
  {"spend" => "--current-spend", "previous-code" => "--previous-code", "code" => "--current-code"}.each do |key, flag|
    options.fetch(key).each { |file| command.concat([flag, file]) }
  end
  abort "Weekly import failed" unless system(*command)
  weekly = JSON.parse(File.read(temporary_week))
  period = weekly.fetch("periods").find { |item| item.fetch("key") == options.fetch("key") }
  abort "Negative usage requires review" if period.fetch("users").values.any? { |u| %w[requests totalTokens codeLines].any? { |k| u.fetch(k) < 0 } }

  target = monthly.fetch("months").find { |item| item.fetch("month") == month }
  abort "Existing monthly baseline required" unless target
  # Store disjoint source components so a corrected weekly upload replaces, rather than adds twice.
  components = target.fetch("components", [target.reject { |key, _| key == "components" }])
  components = components.reject { |item| item["weekKey"] == options.fetch("key") }
  start_date, end_date = [options.fetch("start"), options.fetch("end")].map { |date| Date.iso8601(date) }
  components.each do |item|
    first, last = item.fetch("period").split(" ~ ").map { |date| Date.iso8601(date) }
    abort "Monthly source periods overlap" if first <= end_date && last >= start_date
  end
  spend_emails = options.fetch("spend").flat_map { |file| CSV.read(file, headers: true).map { |row| row.fetch("user_email").strip.downcase } }.uniq
  components << {
    "weekKey" => options.fetch("key"), "fileName" => options.fetch("spend").map { |file| File.basename(file) }.join(" + "),
    "period" => "#{start_date} ~ #{end_date}", "rowCount" => period.dig("source", "currentSpendRows"),
    "users" => period.fetch("users").select { |email, _| spend_emails.include?(email) }.transform_values { |u| u.reject { |key, _| key == "codeLines" } },
  }
  combined = {}
  components.each do |component|
    component.fetch("users").each do |email, usage|
      combined[email] ||= numeric.to_h { |key| [key, 0] }.merge("products" => [], "models" => [])
      numeric.each { |key| combined[email][key] += usage.fetch(key) }
      %w[products models].each { |key| combined[email][key] = (combined[email][key] | usage.fetch(key)).sort }
    end
  end
  combined.each_value { |u| u["netSpendUsd"] = u.fetch("netSpendUsd").round(6) }
  target["users"] = combined.sort.to_h
  target["totals"] = numeric.to_h { |key| [key, combined.values.sum { |u| u.fetch(key) }.round(6)] }
  dates = components.flat_map { |item| item.fetch("period").split(" ~ ") }
  target["period"] = "#{dates.min} ~ #{dates.max}"
  target["coverage"] = "partial"
  target["fileName"] = components.map { |item| item.fetch("fileName") }.join(" + ")
  target["rowCount"] = components.sum { |item| item.fetch("rowCount") }
  target["components"] = components
  monthly["generatedAt"] = now

  temporary_users = File.join(directory, "users.json")
  user_command = ["ruby", File.join(__dir__, "build-individual-utilization-snapshot.rb"), "--output", temporary_users]
  options.fetch("spend").each { |file| user_command.concat(["--spend", file]) }
  options.fetch("code").each { |file| user_command.concat(["--code", "#{month}:#{file}"]) }
  abort "User import failed" unless system(*user_command)
  candidates = JSON.parse(File.read(temporary_users)).fetch("users")
  candidates.each do |candidate|
    next if utilization.fetch("users").any? { |u| u.fetch("email") == candidate.fetch("email") }
    # The legacy aggregate still describes August: do not inject September totals into it.
    candidate.each { |key, value| candidate[key] = 0 if value.is_a?(Numeric) }
    %w[products models].each { |key| candidate[key] = [] }
    %w[productUsage modelUsage monthlyCodeLines].each { |key| candidate[key] = {} }
    candidate["displayName"] = candidate["email"] if candidate["displayName"] == candidate["email"].split("@").first
    candidate["firstObservedMonth"] = month
    utilization.fetch("users") << candidate
  end
  utilization.fetch("users").each do |user|
    email = user.fetch("email")
    user.fetch("monthlyCodeLines")[month] = current_code.fetch(email) if current_code.key?(email)
  end
  utilization["users"].sort_by! { |u| u.fetch("email") }
  source = utilization.dig("source", "codeLines").find { |item| item.fetch("month") == month }
  preserved = utilization.fetch("users").select { |u| !current_code.key?(u.fetch("email")) && u.fetch("monthlyCodeLines").key?(month) }
  source["preservedAccounts"] ||= preserved.map { |u| {"email" => u.fetch("email"), "period" => source.fetch("period"), "codeLines" => u.fetch("monthlyCodeLines").fetch(month), "fileName" => source.fetch("fileName")} }
  source["preservedAccounts"].select! { |account| preserved.any? { |u| u.fetch("email") == account.fetch("email") } }
  source["fileName"] = options.fetch("code").map { |file| File.basename(file) }.join(" + ")
  source["period"] = "#{month}-01 ~ #{options.fetch('end')}"
  source["rowCount"] = current_code.size + preserved.size
  source["totalLines"] = utilization.fetch("users").sum { |u| u.fetch("monthlyCodeLines").fetch(month, 0) }
  utilization["totals"]["codeLines"] = utilization.dig("source", "codeLines").sum { |item| item.fetch("totalLines") }
  utilization["totals"]["users"] = utilization.fetch("users").size
  utilization["source"]["generatedAt"] = now
  [weekly, monthly, utilization].zip(paths).each { |data, path| File.write(path, JSON.pretty_generate(data) + "\n") }
  puts JSON.pretty_generate({"week" => period.fetch("totals"), "month" => target.fetch("totals"), "monthlyCodeLines" => source.fetch("totalLines"), "preservedCodeAccounts" => preserved.map { |u| u.fetch("email") }})
end
