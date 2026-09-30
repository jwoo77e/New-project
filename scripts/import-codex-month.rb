require "csv"
require "json"
require "date"
require "optparse"

options = { "output" => File.expand_path("../src/data/codexUsageSnapshot.json", __dir__) }
OptionParser.new do |parser|
  parser.on("--output PATH") { |value| options["output"] = value }
end.parse!
file, start_date, end_date, week_key, week_label = ARGV
abort "Usage: ruby scripts/import-codex-month.rb [--output PATH] CSV START END WEEK_KEY WEEK_LABEL" unless week_label
first, last = [start_date, end_date].map { |date| Date.iso8601(date) }
abort "Expected one complete calendar month" unless first.day == 1 && last == first.next_month - 1
rows = CSV.read(file, headers: true, encoding: "bom|utf-8")
abort "Invalid Codex columns" unless ["Email", "Tokens", "Lines of code"].all? { |key| rows.headers.include?(key) }
users = {}
rows.each do |row|
  email = row.fetch("Email").strip.downcase
  abort "Missing or duplicate account" if email.empty? || users.key?(email)
  tokens = Integer(row.fetch("Tokens").delete(","))
  lines = Integer(row.fetch("Lines of code").delete(","))
  abort "Negative usage" if tokens < 0 || lines < 0
  users[email] = { "tokens" => tokens, "codeLines" => lines }
end
abort "Empty monthly export" if users.empty?
snapshot = JSON.parse(File.read(options.fetch("output")))
baseline = snapshot.fetch("periods").select { |p| p.fetch("startDate") <= end_date && p.fetch("endDate") >= start_date }
abort "No weekly baseline" if baseline.empty?
abort "Weekly baseline crosses the month boundary" if baseline.any? { |p| p.fetch("startDate") < start_date || p.fetch("endDate") > end_date }
baseline.sort_by! { |p| p.fetch("startDate") }
covered_days = baseline.flat_map { |p| (Date.iso8601(p.fetch("startDate"))..Date.iso8601(p.fetch("endDate"))).to_a }
abort "Overlapping weekly baseline" unless covered_days.uniq.length == covered_days.length
remaining_days = (first..last).to_a - covered_days
abort "No month-end remainder" if remaining_days.empty? || covered_days.include?(last)
ranges = remaining_days.chunk_while { |a, b| b == a + 1 }.map { |days| { "startDate" => days.first.to_s, "endDate" => days.last.to_s } }
missing = baseline.flat_map { |p| p.fetch("users").keys }.uniq - users.keys
abort "Monthly export is missing baseline accounts: #{missing.join(', ')}" unless missing.empty?
residual = users.to_h do |email, usage|
  delta = usage.to_h do |metric, value|
    previous = baseline.sum { |p| p.fetch("users").fetch(email, {}).fetch(metric, 0) }
    abort "Negative #{metric} remainder for #{email}" if value < previous
    [metric, value - previous]
  end
  [email, delta]
end
monthly = { "startDate" => start_date, "endDate" => end_date, "fileName" => File.basename(file), "users" => users.sort.to_h }
snapshot["monthlyPeriods"] = snapshot.fetch("monthlyPeriods", []).reject { |p| p.fetch("startDate") == start_date } + [monthly]
snapshot["monthlyPeriods"].sort_by! { |p| p.fetch("startDate") }
extra_ranges = ranges[0...-1]
note = "월 전체에서 기존 주차 합계를 뺀 값입니다."
unless extra_ranges.empty?
  note += " #{extra_ranges.map { |r| "#{r.fetch('startDate')} ~ #{r.fetch('endDate')}" }.join(', ')} 미분리 사용량이 포함되어 #{ranges.last.fetch('startDate')} ~ #{end_date}만의 사용량으로 확정할 수 없습니다."
end
derived = {
  "key" => week_key, "label" => week_label,
  "startDate" => ranges.last.fetch("startDate"), "endDate" => end_date,
  "method" => "monthly_total_minus_reported_weeks", "fileName" => File.basename(file),
  "subtractedPeriods" => baseline.map { |p| p.slice("startDate", "endDate", "fileName") },
  "usageRanges" => ranges, "periodAligned" => extra_ranges.empty?, "note" => note,
  "users" => residual.sort.to_h,
}
snapshot["derivedPeriods"] = snapshot.fetch("derivedPeriods", []).reject { |p| p.fetch("key") == week_key } + [derived]
snapshot["derivedPeriods"].sort_by! { |p| p.fetch("startDate") }
File.write(options.fetch("output"), JSON.pretty_generate(snapshot) + "\n")
puts JSON.pretty_generate({ "accounts" => users.size, "month" => %w[tokens codeLines].to_h { |key| [key, users.values.sum { |u| u.fetch(key) }] }, "remainder" => %w[tokens codeLines].to_h { |key| [key, residual.values.sum { |u| u.fetch(key) }] }, "usageRanges" => ranges })
