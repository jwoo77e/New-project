require "csv"
require "json"
require "date"
require "optparse"

options = { "output" => File.expand_path("../src/data/codexUsageSnapshot.json", __dir__) }
OptionParser.new do |parser|
  parser.on("--output PATH") { |value| options["output"] = value }
end.parse!

file, start_date, end_date = ARGV
abort "Usage: ruby scripts/import-codex-usage.rb CSV START END" unless file && start_date && end_date
abort "Invalid period" if Date.iso8601(start_date) > Date.iso8601(end_date)
rows = CSV.read(file, headers: true, encoding: "bom|utf-8")
abort "Invalid Codex columns" unless ["Email", "Tokens", "Lines of code"].all? { |key| rows.headers.include?(key) }
users = {}
rows.each do |row|
  email = row.fetch("Email").strip.downcase
  abort "Missing or duplicate account" if email.empty? || users.key?(email)
  tokens = Integer(row.fetch("Tokens").delete(","))
  lines = Integer(row.fetch("Lines of code").delete(","))
  abort "Negative usage" if tokens < 0 || lines < 0
  users[email] = {"tokens" => tokens, "codeLines" => lines}
end
abort "Empty Codex export" if users.empty?
output = options.fetch("output")
snapshot = File.exist?(output) ? JSON.parse(File.read(output)) : {"periods" => []}
periods = snapshot.fetch("periods").reject { |p| p.fetch("startDate") == start_date && p.fetch("endDate") == end_date }
abort "Overlapping Codex source periods" if periods.any? { |p| p.fetch("startDate") <= end_date && p.fetch("endDate") >= start_date }
periods << {"startDate" => start_date, "endDate" => end_date, "fileName" => File.basename(file), "users" => users.sort.to_h}
snapshot["periods"] = periods.sort_by { |p| p.fetch("startDate") }
# Keep the old estimate as provenance; the explicit period supersedes it.
snapshot.fetch("derivedPeriods", []).each do |derived|
  actual = snapshot.fetch("periods").find { |period| period.fetch("startDate") == derived.fetch("startDate") && period.fetch("endDate") == derived.fetch("endDate") }
  derived["supersededBy"] = actual.fetch("fileName") if actual
end
# Provider exports can disagree slightly. Preserve both authoritative sources,
# and record a discrepancy instead of inventing negative usage for missing days.
snapshot["monthlyReconciliations"] = snapshot.fetch("monthlyPeriods", []).map do |month|
  included = snapshot.fetch("periods").select { |period| period.fetch("startDate") >= month.fetch("startDate") && period.fetch("endDate") <= month.fetch("endDate") }
  emails = (month.fetch("users").keys + included.flat_map { |period| period.fetch("users").keys }).uniq.sort
  discrepancies = emails.flat_map do |email|
    %w[tokens codeLines].map do |metric|
      monthly_total = month.fetch("users").fetch(email, {}).fetch(metric, 0)
      period_total = included.sum { |period| period.fetch("users").fetch(email, {}).fetch(metric, 0) }
      { "email" => email, "metric" => metric, "monthlyTotal" => monthly_total, "periodsTotal" => period_total, "excess" => period_total - monthly_total } if period_total > monthly_total
    end.compact
  end
  next if discrepancies.empty?
  { "startDate" => month.fetch("startDate"), "endDate" => month.fetch("endDate"), "monthlyFile" => month.fetch("fileName"),
    "comparedPeriods" => included.map { |period| period.slice("startDate", "endDate", "fileName") }, "discrepancies" => discrepancies }
end.compact
File.write(output, JSON.pretty_generate(snapshot) + "\n")
puts "Imported #{users.size} Codex accounts: #{users.values.sum { |u| u.fetch('tokens') }} tokens, #{users.values.sum { |u| u.fetch('codeLines') }} lines"
