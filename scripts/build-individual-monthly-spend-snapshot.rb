#!/usr/bin/env ruby

require "csv"
require "date"
require "json"
require "optparse"
require "set"
require "time"

options = {
  months: [],
  git_snapshots: [],
  missing: [],
  user_overlays: [],
  output: "src/data/individualMonthlySpendSnapshot.json",
}

OptionParser.new do |parser|
  parser.banner = <<~USAGE
    Usage: ruby scripts/build-individual-monthly-spend-snapshot.rb \
      --month 2026-07:2026-07-01:2026-07-29:/path/to/spend.csv \
      --missing 2026-06
  USAGE

  parser.on("--month MONTH:START:END:PATH", "Monthly Spend report and coverage period") do |value|
    month, start_date, end_date, path = value.split(":", 4)
    unless month&.match?(/\A\d{4}-\d{2}\z/) && start_date && end_date && path
      raise OptionParser::InvalidArgument, "--month requires MONTH:START:END:PATH"
    end

    options[:months] << [month, start_date, end_date, path]
  end
  parser.on("--git-snapshot MONTH:START:END:REV:REPO_PATH", "Historical Claude usage snapshot") do |value|
    month, start_date, end_date, revision, repo_path = value.split(":", 5)
    unless month&.match?(/\A\d{4}-\d{2}\z/) && start_date && end_date && revision && repo_path
      raise OptionParser::InvalidArgument, "--git-snapshot requires MONTH:START:END:REV:REPO_PATH"
    end

    options[:git_snapshots] << [month, start_date, end_date, revision, repo_path]
  end
  parser.on("--missing MONTH", "Month without a monthly Spend report") { |value| options[:missing] << value }
  parser.on("--user-overlay MONTH:EMAIL:PATH", "Replace one user's monthly Spend rows") do |value|
    month, email, path = value.split(":", 3)
    unless month&.match?(/\A\d{4}-\d{2}\z/) && email&.include?("@") && path
      raise OptionParser::InvalidArgument, "--user-overlay requires MONTH:EMAIL:PATH"
    end

    options[:user_overlays] << [month, email.downcase, path]
  end
  parser.on("--output PATH", "Output JSON path") { |value| options[:output] = value }
end.parse!

abort "at least one monthly source is required" if options[:months].empty? && options[:git_snapshots].empty?

def integer(row, key)
  row[key].to_s.delete(",").to_i
end

def decimal(row, key)
  row[key].to_s.delete(",").to_f
end

def coverage_for(month, periods)
  year, month_number = month.split("-").map(&:to_i)
  month_start = Date.new(year, month_number, 1)
  month_end = Date.new(year, month_number, -1)
  intervals = periods.map do |period|
    start_date, end_date = period.split(" ~ ").map { |value| Date.parse(value) }
    [start_date, end_date]
  end.sort_by(&:first)

  return "partial" if intervals.empty? || intervals.first.first > month_start

  covered_through = intervals.first.last
  intervals.drop(1).each do |start_date, end_date|
    return "partial" if start_date > covered_through + 1

    covered_through = [covered_through, end_date].max
  end
  covered_through >= month_end ? "complete" : "partial"
end

months = options[:months].sort.map do |month, start_date, end_date, path|
  users = Hash.new do |hash, email|
    hash[email] = {
      "requests" => 0,
      "promptTokens" => 0,
      "completionTokens" => 0,
      "totalTokens" => 0,
      "netSpendUsd" => 0.0,
      "products" => Set.new,
      "models" => Set.new,
    }
  end
  row_count = 0

  CSV.foreach(path, headers: true) do |row|
    email = row["user_email"].to_s.strip.downcase
    next if email.empty?

    row_count += 1
    user = users[email]
    prompt_tokens = integer(row, "total_prompt_tokens")
    completion_tokens = integer(row, "total_completion_tokens")
    user["requests"] += integer(row, "total_requests")
    user["promptTokens"] += prompt_tokens
    user["completionTokens"] += completion_tokens
    user["totalTokens"] += prompt_tokens + completion_tokens
    user["netSpendUsd"] += decimal(row, "total_net_spend_usd")
    product = row["product"].to_s.strip
    model = row["model"].to_s.strip
    user["products"] << product unless product.empty?
    user["models"] << model unless model.empty?
  end

  users.each_value { |user| user["netSpendUsd"] = user["netSpendUsd"].round(6) }
  totals = users.each_value.each_with_object({
    "requests" => 0,
    "promptTokens" => 0,
    "completionTokens" => 0,
    "totalTokens" => 0,
    "netSpendUsd" => 0.0,
  }) do |user, memo|
    %w[requests promptTokens completionTokens totalTokens].each { |key| memo[key] += user[key] }
    memo["netSpendUsd"] += user["netSpendUsd"]
  end
  totals["netSpendUsd"] = totals["netSpendUsd"].round(6)

  serialized_users = users.sort.to_h do |email, user|
    [email, user.merge("products" => user["products"].to_a.sort, "models" => user["models"].to_a.sort)]
  end
  period = "#{start_date} ~ #{end_date}"
  {
    "month" => month,
    "fileName" => File.basename(path),
    "period" => period,
    "rowCount" => row_count,
    "coverage" => coverage_for(month, [period]),
    "totals" => totals,
    "users" => serialized_users,
  }
end

git_months = options[:git_snapshots].sort.map do |month, start_date, end_date, revision, repo_path|
  source = IO.popen(["git", "show", "#{revision}:#{repo_path}"], &:read)
  abort "failed to read #{revision}:#{repo_path}" unless $?.success?

  object_text = source[/initialClaudeTeamUsageData: ClaudeTeamUsageData = (\{.*\});\s*\z/m, 1]
  abort "unable to parse Claude usage snapshot at #{revision}:#{repo_path}" unless object_text

  data = JSON.parse(object_text)
  users = data.fetch("users").to_h do |user|
    [
      user.fetch("email").downcase,
      {
        "requests" => user.fetch("requests"),
        "promptTokens" => user.fetch("promptTokens"),
        "completionTokens" => user.fetch("completionTokens"),
        "totalTokens" => user.fetch("totalTokens"),
        "netSpendUsd" => user.fetch("netSpendUsd"),
        "products" => user.fetch("products", []),
        "models" => user.fetch("models", []),
      },
    ]
  end
  period = "#{start_date} ~ #{end_date}"

  {
    "month" => month,
    "fileName" => data.dig("source", "spendFile"),
    "period" => period,
    "rowCount" => nil,
    "coverage" => coverage_for(month, [period]),
    "sourceCommit" => revision,
    "totals" => {
      "requests" => data.fetch("totalRequests"),
      "promptTokens" => data.fetch("totalPromptTokens"),
      "completionTokens" => data.fetch("totalCompletionTokens"),
      "totalTokens" => data.fetch("totalTokens"),
      "netSpendUsd" => data.fetch("totalNetSpendUsd"),
    },
    "users" => users.sort.to_h,
  }
end

months = (months + git_months).group_by { |item| item.fetch("month") }.map do |month, sources|
  next sources.first if sources.length == 1

  users = Hash.new do |hash, email|
    hash[email] = {
      "requests" => 0,
      "promptTokens" => 0,
      "completionTokens" => 0,
      "totalTokens" => 0,
      "netSpendUsd" => 0.0,
      "products" => Set.new,
      "models" => Set.new,
    }
  end
  sources.each do |source|
    source.fetch("users").each do |email, usage|
      %w[requests promptTokens completionTokens totalTokens].each do |key|
        users[email][key] += usage.fetch(key)
      end
      users[email]["netSpendUsd"] += usage.fetch("netSpendUsd")
      users[email]["products"].merge(usage.fetch("products", []))
      users[email]["models"].merge(usage.fetch("models", []))
    end
  end
  users.each_value { |usage| usage["netSpendUsd"] = usage["netSpendUsd"].round(6) }
  totals = users.each_value.each_with_object({
    "requests" => 0,
    "promptTokens" => 0,
    "completionTokens" => 0,
    "totalTokens" => 0,
    "netSpendUsd" => 0.0,
  }) do |usage, memo|
    %w[requests promptTokens completionTokens totalTokens].each { |key| memo[key] += usage[key] }
    memo["netSpendUsd"] += usage["netSpendUsd"]
  end
  totals["netSpendUsd"] = totals["netSpendUsd"].round(6)
  start_dates = sources.map { |source| Date.parse(source.fetch("period").split(" ~ ").first) }
  end_dates = sources.map { |source| Date.parse(source.fetch("period").split(" ~ ").last) }
  serialized_users = users.sort.to_h do |email, usage|
    [email, usage.merge("products" => usage["products"].to_a.sort, "models" => usage["models"].to_a.sort)]
  end
  periods = sources.map { |source| source.fetch("period") }

  {
    "month" => month,
    "fileName" => sources.map { |source| source.fetch("fileName") }.join(" + "),
    "period" => "#{start_dates.min.iso8601} ~ #{end_dates.max.iso8601}",
    "rowCount" => sources.all? { |source| source["rowCount"] } ? sources.sum { |source| source.fetch("rowCount") } : nil,
    "coverage" => coverage_for(month, periods),
    "totals" => totals,
    "users" => serialized_users,
  }
end.sort_by { |item| item.fetch("month") }

options[:user_overlays].each do |month, email, path|
  target = months.find { |item| item.fetch("month") == month }
  abort "monthly source missing for user overlay: #{month}" unless target

  usage = {
    "requests" => 0,
    "promptTokens" => 0,
    "completionTokens" => 0,
    "totalTokens" => 0,
    "netSpendUsd" => 0.0,
    "products" => Set.new,
    "models" => Set.new,
  }
  overlay_rows = 0
  CSV.foreach(path, headers: true) do |row|
    next unless row["user_email"].to_s.strip.downcase == email

    overlay_rows += 1
    prompt_tokens = integer(row, "total_prompt_tokens")
    completion_tokens = integer(row, "total_completion_tokens")
    usage["requests"] += integer(row, "total_requests")
    usage["promptTokens"] += prompt_tokens
    usage["completionTokens"] += completion_tokens
    usage["totalTokens"] += prompt_tokens + completion_tokens
    usage["netSpendUsd"] += decimal(row, "total_net_spend_usd")
    usage["products"] << row["product"].to_s.strip unless row["product"].to_s.strip.empty?
    usage["models"] << row["model"].to_s.strip unless row["model"].to_s.strip.empty?
  end
  abort "user overlay has no matching rows: #{month} #{email}" if overlay_rows.zero?

  usage["netSpendUsd"] = usage["netSpendUsd"].round(6)
  target.fetch("users")[email] = usage.merge(
    "products" => usage["products"].to_a.sort,
    "models" => usage["models"].to_a.sort,
  )
  target["users"] = target.fetch("users").sort.to_h
  target["totals"] = target.fetch("users").values.each_with_object({
    "requests" => 0,
    "promptTokens" => 0,
    "completionTokens" => 0,
    "totalTokens" => 0,
    "netSpendUsd" => 0.0,
  }) do |user, memo|
    %w[requests promptTokens completionTokens totalTokens].each { |key| memo[key] += user.fetch(key) }
    memo["netSpendUsd"] += user.fetch("netSpendUsd")
  end
  target["totals"]["netSpendUsd"] = target["totals"]["netSpendUsd"].round(6)
  target["fileName"] = "#{target.fetch('fileName')} + #{File.basename(path)} (#{email} overlay)"
  target["rowCount"] = nil
  target["userOverlays"] ||= []
  target["userOverlays"] << { "email" => email, "fileName" => File.basename(path), "rowCount" => overlay_rows }
end

snapshot = {
  "generatedAt" => Time.now.getlocal("+09:00").iso8601,
  "months" => months,
  "missingMonths" => options[:missing].uniq.sort,
  "notes" => [
    "월별 요청·토큰은 해당 월 입력 Spend report의 기간 합계이며 월 전체 파일을 우선 사용합니다.",
    "월초 이후에 시작하거나 월말 이전에 종료되거나 기간 사이에 공백이 있는 report는 부분 누적으로 표시합니다.",
    "원본 CSV가 현재 없고 검증된 과거 커밋에 개인별 합계가 남은 달은 해당 스냅샷을 합산합니다.",
    "월별 Spend report가 없는 달은 다른 기간 자료로 추정하지 않습니다.",
  ],
}

File.write(options[:output], JSON.pretty_generate(snapshot) + "\n")
puts "Wrote #{options[:output]} (#{months.length} monthly Spend sources)"
