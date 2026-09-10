require "csv"
require "json"
require "date"

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
output = File.expand_path("../src/data/codexUsageSnapshot.json", __dir__)
snapshot = File.exist?(output) ? JSON.parse(File.read(output)) : {"periods" => []}
periods = snapshot.fetch("periods").reject { |p| p.fetch("startDate") == start_date && p.fetch("endDate") == end_date }
abort "Overlapping Codex source periods" if periods.any? { |p| p.fetch("startDate") <= end_date && p.fetch("endDate") >= start_date }
periods << {"startDate" => start_date, "endDate" => end_date, "fileName" => File.basename(file), "users" => users.sort.to_h}
snapshot["periods"] = periods.sort_by { |p| p.fetch("startDate") }
File.write(output, JSON.pretty_generate(snapshot) + "\n")
puts "Imported #{users.size} Codex accounts: #{users.values.sum { |u| u.fetch('tokens') }} tokens, #{users.values.sum { |u| u.fetch('codeLines') }} lines"
