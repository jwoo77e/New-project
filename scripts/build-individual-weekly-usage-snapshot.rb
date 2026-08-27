#!/usr/bin/env ruby

require "csv"
require "date"
require "json"
require "optparse"
require "time"

options = {
  output: "src/data/individualWeeklyUsageSnapshot.json",
  spend_mode: "cumulative-delta",
  code_mode: "cumulative-delta",
  current_spend: [],
}

OptionParser.new do |parser|
  parser.banner = <<~USAGE
    Usage: ruby scripts/build-individual-weekly-usage-snapshot.rb \
      --key 2026-08-W2 --label "8월 2주차" --start 2026-08-06 --end 2026-08-12 \
      --spend-mode period --current-spend /path/to/current-spend.csv \
      --code-mode cumulative-delta --previous-code /path/to/previous-code.csv \
      --current-code /path/to/current-code.csv
  USAGE

  parser.on("--key KEY", "Stable weekly period key") { |value| options[:key] = value }
  parser.on("--label LABEL", "Dashboard label") { |value| options[:label] = value }
  parser.on("--start DATE", "Inclusive period start") { |value| options[:start_date] = value }
  parser.on("--end DATE", "Inclusive period end") { |value| options[:end_date] = value }
  parser.on("--previous-spend PATH", "Previous cumulative Spend report") { |value| options[:previous_spend] = value }
  parser.on("--current-spend PATH", "Current cumulative Spend report (repeatable)") do |value|
    options[:current_spend] << value
  end
  parser.on("--spend-mode MODE", %w[period cumulative-delta], "Spend source mode") { |value| options[:spend_mode] = value }
  parser.on("--previous-code PATH", "Previous cumulative Code Lines report") { |value| options[:previous_code] = value }
  parser.on("--current-code PATH", "Current cumulative Code Lines report") { |value| options[:current_code] = value }
  parser.on("--code-mode MODE", %w[period cumulative-delta], "Code Lines source mode") { |value| options[:code_mode] = value }
  parser.on("--output PATH", "Output JSON path") { |value| options[:output] = value }
end.parse!

required = %i[key label start_date end_date current_code]
required << :previous_spend if options[:spend_mode] == "cumulative-delta"
required << :previous_code if options[:code_mode] == "cumulative-delta"
missing = required.select { |key| options[key].to_s.empty? }
missing << :current_spend if options[:current_spend].empty?
abort "missing options: #{missing.join(', ')}" unless missing.empty?

start_date = Date.iso8601(options[:start_date])
end_date = Date.iso8601(options[:end_date])
period_days = (end_date - start_date).to_i + 1
abort "weekly period must contain 1 to 7 days" unless period_days.between?(1, 7)

METRICS = {
  "requests" => "total_requests",
  "promptTokens" => "total_prompt_tokens",
  "completionTokens" => "total_completion_tokens",
  "netSpendUsd" => "total_net_spend_usd",
}.freeze

def number(row, column)
  row[column].to_s.delete(",$").to_f
end

def read_spend(paths)
  users = Hash.new do |hash, email|
    hash[email] = {
      "requests" => 0,
      "promptTokens" => 0,
      "completionTokens" => 0,
      "netSpendUsd" => 0.0,
      "products" => {},
      "models" => {},
    }
  end
  row_count = 0

  Array(paths).each do |path|
    CSV.foreach(path, headers: true) do |row|
      email = row["user_email"].to_s.strip.downcase
      next if email.empty?

      row_count += 1
      user = users[email]
      METRICS.each do |target, source|
        user[target] += number(row, source)
      end
      product = row["product"].to_s.strip
      model = row["model"].to_s.strip
      user["products"][product] = true unless product.empty?
      user["models"][model] = true unless model.empty?
    end
  end

  [users, row_count]
end

def read_code(path)
  rows = {}
  CSV.foreach(path, headers: true) do |row|
    email = row["User"].to_s.strip.downcase
    next if email.empty?

    rows[email] = row["Lines this Month"].to_s.delete(",").to_i
  end
  rows
end

previous_spend, previous_spend_rows = options[:spend_mode] == "cumulative-delta" ? read_spend(options[:previous_spend]) : [{}, 0]
current_spend, current_spend_rows = read_spend(options[:current_spend])
previous_code = options[:code_mode] == "cumulative-delta" ? read_code(options[:previous_code]) : {}
current_code = read_code(options[:current_code])

emails = (previous_spend.keys | current_spend.keys | previous_code.keys | current_code.keys).sort
users = emails.to_h do |email|
  previous = previous_spend.fetch(email, {})
  current = current_spend[email]
  values = METRICS.keys.to_h do |metric|
    delta = current.fetch(metric, 0) - previous.fetch(metric, 0)
    [metric, metric == "netSpendUsd" ? delta.round(6) : delta.to_i]
  end
  values["totalTokens"] = values["promptTokens"] + values["completionTokens"]
  values["codeLines"] = current_code.fetch(email, 0) - previous_code.fetch(email, 0)
  values["products"] = current.fetch("products", {}).keys.sort
  values["models"] = current.fetch("models", {}).keys.sort
  [email, values]
end

totals = users.values.each_with_object({
  "activeUsers" => 0,
  "requests" => 0,
  "promptTokens" => 0,
  "completionTokens" => 0,
  "totalTokens" => 0,
  "netSpendUsd" => 0.0,
  "codeLines" => 0,
}) do |user, memo|
  memo["activeUsers"] += 1 if user["requests"] > 0 || user["totalTokens"] > 0 || user["codeLines"] > 0
  %w[requests promptTokens completionTokens totalTokens codeLines].each { |metric| memo[metric] += user[metric] }
  memo["netSpendUsd"] += user["netSpendUsd"]
end
totals["netSpendUsd"] = totals["netSpendUsd"].round(6)

existing = File.exist?(options[:output]) ? JSON.parse(File.read(options[:output])) : { "periods" => [] }
period = {
  "key" => options[:key],
  "label" => options[:label],
  "startDate" => start_date.iso8601,
  "endDate" => end_date.iso8601,
  "coverage" => "complete",
  "source" => {
    "previousSpendFile" => options[:previous_spend] && File.basename(options[:previous_spend]),
    "currentSpendFile" => options[:current_spend].map { |path| File.basename(path) }.join(" + "),
    "previousSpendRows" => previous_spend_rows,
    "currentSpendRows" => current_spend_rows,
    "previousCodeFile" => options[:previous_code] && File.basename(options[:previous_code]),
    "currentCodeFile" => File.basename(options[:current_code]),
    "spendMethod" => options[:spend_mode] == "period" ? "period_total" : "current_cumulative_minus_previous_cumulative",
    "codeMethod" => options[:code_mode] == "period" ? "period_total" : "current_cumulative_minus_previous_cumulative",
  },
  "totals" => totals,
  "users" => users,
  "notes" => [
    "Spend는 해당 주차 조회 기간 합계를 사용합니다.",
    options[:code_mode] == "period" ?
      "Code Lines는 해당 주차 파일의 기간 합계를 사용합니다." :
      "Code Lines는 최신 월 누적 스냅샷에서 직전 스냅샷을 뺀 주차 순증입니다.",
  ],
}

periods = existing.fetch("periods", []).reject { |item| item["key"] == options[:key] }
periods << period
snapshot = {
  "generatedAt" => Time.now.getlocal("+09:00").iso8601,
  "periods" => periods.sort_by { |item| item.fetch("startDate") },
}

File.write(options[:output], JSON.pretty_generate(snapshot) + "\n")
puts "Wrote #{options[:output]} (#{period.fetch('label')}, #{totals.fetch('activeUsers')} active users)"
