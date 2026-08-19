#!/usr/bin/env ruby

require "csv"
require "date"
require "json"
require "optparse"
require "set"
require "time"

options = {
  code: [],
  spend: [],
  output: "src/data/individualUtilizationSnapshot.json",
}

OptionParser.new do |parser|
  parser.banner = <<~USAGE
    Usage: ruby scripts/build-individual-utilization-snapshot.rb \
      --spend /path/to/spend.csv \
      --code 2026-05:/path/to/code-lines.csv \
      --conversations /path/to/conversations.json \
      --users /path/to/users.json
  USAGE

  parser.on("--spend PATH", "Claude Team spend report CSV (repeatable)") { |value| options[:spend] << value }
  parser.on("--spend-period PERIOD", "Spend report coverage label") { |value| options[:spend_period] = value }
  parser.on("--code MONTH:PATH", "Monthly Claude Code lines CSV (repeatable)") do |value|
    month, path = value.split(":", 2)
    raise OptionParser::InvalidArgument, "--code requires MONTH:PATH" unless month&.match?(/\A\d{4}-\d{2}\z/) && path

    options[:code] << [month, path]
  end
  parser.on("--conversations PATH", "Claude export conversations.json") { |value| options[:conversations] = value }
  parser.on("--users PATH", "Claude export users.json") { |value| options[:users] = value }
  parser.on("--preserve-activity-revision REV", "Keep conversation activity from a verified Git snapshot") do |value|
    options[:preserve_activity_revision] = value
  end
  parser.on("--output PATH", "Output JSON path") { |value| options[:output] = value }
end.parse!

abort "--spend is required" if options[:spend].empty?
abort "at least one --code is required" if options[:code].empty?

DISPLAY_NAMES = {
  "hhlee0227@riskzero.kr" => "이한호 대리",
  "wody@riskzero.kr" => "정재요 차장",
  "woosung.jeon@riskzero.kr" => "전우성 부장",
  "hchbae1001@riskzero.kr" => "배현철 사원",
  "sieghaft@riskzero.kr" => "김성진 부장",
  "huizhen0227@riskzero.kr" => "김혜진 과장",
  "jungyr98@riskzero.kr" => "정유라 사원",
  "rkgmf1230@riskzero.kr" => "김가흘 대리",
  "mygu@riskzero.kr" => "구문영 사원",
  "mjkim1122@riskzero.kr" => "김민정 차장",
  "kys0392@riskzero.kr" => "김영산 과장",
  "staycurious@riskzero.kr" => "김하나 과장",
  "sjlim@riskzero.kr" => "임성진 부장",
  "ykchj1011@riskzero.kr" => "윤영관 과장",
  "crow326@riskzero.kr" => "박정원 차장",
  "jisub1221@riskzero.kr" => "심지섭 대리",
  "mjlee0828@riskzero.kr" => "이민재 부장",
  "jaewoo.kim@riskzero.kr" => "김재우 부장",
  "jhpark@riskzero.kr" => "박재현 상무",
  "dhlee@riskzero.kr" => "이동훈 부장",
  "sjpark@riskzero.kr" => "박수진 과장",
  "songinna@riskzero.kr" => "송인나 대리",
  "drager72@riskzero.kr" => "최종윤 이사",
  "use0505@riskzero.kr" => "최용호 대리",
  "airyoubi77@riskzero.kr" => "조욱상 이사",
  "khoon@riskzero.kr" => "강훈 부장",
  "woals1329@riskzero.kr" => "강재민 사원",
  "doyul@riskzero.kr" => "김도율 차장",
  "kjh17@riskzero.kr" => "김진희 과장",
  "day@riskzero.kr" => "고원상 대리",
  "lbh0902@riskzero.kr" => "이병현 이사",
  "cslee@riskzero.kr" => "이창섭 부장",
  "pentasix@riskzero.kr" => "이진욱 부장",
  "pms0805@riskzero.kr" => "박명수 과장",
  "jhyun@riskzero.kr" => "윤종호 부장",
  "jyjo@riskzero.kr" => "조주연 부장",
  "bigone@riskzero.kr" => "김대일 상무",
  "hb777lee@riskzero.kr" => "이형배 상무",
  "sblim0519@riskzero.kr" => "임성범 부장",
  "yspark@riskzero.kr" => "박연석 전무",
}.freeze

def number(row, key)
  row[key].to_s.delete(",").to_f
end

def integer(row, key)
  number(row, key).to_i
end

def blank_user
  {
    "requests" => 0,
    "promptTokens" => 0,
    "completionTokens" => 0,
    "netSpendUsd" => 0.0,
    "grossSpendUsd" => 0.0,
    "uncachedInputTokens" => 0,
    "cacheReadTokens" => 0,
    "cacheWrite5mTokens" => 0,
    "cacheWrite1hTokens" => 0,
    "webSearchCount" => 0,
    "products" => Set.new,
    "models" => Set.new,
    "productUsage" => {},
    "modelUsage" => {},
    "monthlyCodeLines" => {},
    "monthlyActivity" => {},
    "weeklyActivity" => {},
  }
end

def activity_bucket(container, key)
  container[key] ||= {
    "conversations" => 0,
    "humanPrompts" => 0,
    "assistantResponses" => 0,
    "activeDays" => Set.new,
  }
end

def kst_time(value)
  Time.parse(value).getlocal("+09:00")
end

users = Hash.new { |hash, email| hash[email] = blank_user }
spend_rows = 0

options[:spend].each do |spend_path|
CSV.foreach(spend_path, headers: true) do |row|
  email = row["user_email"].to_s.strip.downcase
  next if email.empty?

  spend_rows += 1
  user = users[email]
  requests = integer(row, "total_requests")
  prompt_tokens = integer(row, "total_prompt_tokens")
  completion_tokens = integer(row, "total_completion_tokens")
  net_spend = number(row, "total_net_spend_usd")
  gross_spend = number(row, "total_gross_spend_usd")
  product = row["product"].to_s.strip
  model = row["model"].to_s.strip

  user["requests"] += requests
  user["promptTokens"] += prompt_tokens
  user["completionTokens"] += completion_tokens
  user["netSpendUsd"] += net_spend
  user["grossSpendUsd"] += gross_spend
  user["uncachedInputTokens"] += integer(row, "total_uncached_input_tokens")
  user["cacheReadTokens"] += integer(row, "total_cache_read_tokens")
  user["cacheWrite5mTokens"] += integer(row, "total_cache_write_5m_tokens")
  user["cacheWrite1hTokens"] += integer(row, "total_cache_write_1h_tokens")
  user["webSearchCount"] += integer(row, "total_web_search_count")
  user["products"] << product unless product.empty?
  user["models"] << model unless model.empty?

  unless product.empty?
    product_usage = user["productUsage"][product] ||= {
      "requests" => 0,
      "tokens" => 0,
      "netSpendUsd" => 0.0,
    }
    product_usage["requests"] += requests
    product_usage["tokens"] += prompt_tokens + completion_tokens
    product_usage["netSpendUsd"] += net_spend
  end

  unless model.empty?
    model_usage = user["modelUsage"][model] ||= {
      "requests" => 0,
      "tokens" => 0,
      "netSpendUsd" => 0.0,
    }
    model_usage["requests"] += requests
    model_usage["tokens"] += prompt_tokens + completion_tokens
    model_usage["netSpendUsd"] += net_spend
  end
end
end

latest_code_inputs = options[:code].each_with_object({}) do |(month, path), inputs|
  inputs[month] = path
end

code_sources = latest_code_inputs.sort.map do |month, path|
  row_count = 0
  total_lines = 0

  CSV.foreach(path, headers: true) do |row|
    email = row["User"].to_s.strip.downcase
    next if email.empty?

    lines = row["Lines this Month"].to_s.delete(",").to_i
    users[email]["monthlyCodeLines"][month] = lines
    row_count += 1
    total_lines += lines
  end

  {
    "month" => month,
    "fileName" => File.basename(path),
    "rowCount" => row_count,
    "totalLines" => total_lines,
  }
end

conversation_source = nil
if options[:conversations] && options[:users]
  account_to_email = JSON.parse(File.read(options[:users])).to_h do |user|
    [user.fetch("uuid"), user.fetch("email_address").to_s.downcase]
  end
  conversations = JSON.parse(File.read(options[:conversations]))
  conversation_dates = []
  message_count = 0

  conversations.each do |conversation|
    email = account_to_email[conversation.dig("account", "uuid")]
    next unless email

    created_at = kst_time(conversation.fetch("created_at"))
    conversation_dates << created_at
    month_key = created_at.strftime("%Y-%m")
    week_key = (created_at.to_date - (created_at.to_date.cwday - 1)).iso8601
    activity_bucket(users[email]["monthlyActivity"], month_key)["conversations"] += 1
    activity_bucket(users[email]["weeklyActivity"], week_key)["conversations"] += 1

    conversation.fetch("chat_messages", []).each do |message|
      message_count += 1
      message_time = kst_time(message.fetch("created_at"))
      message_month = message_time.strftime("%Y-%m")
      message_week = (message_time.to_date - (message_time.to_date.cwday - 1)).iso8601
      sender_key = message["sender"] == "human" ? "humanPrompts" : "assistantResponses"

      monthly_bucket = activity_bucket(users[email]["monthlyActivity"], message_month)
      weekly_bucket = activity_bucket(users[email]["weeklyActivity"], message_week)
      monthly_bucket[sender_key] += 1
      weekly_bucket[sender_key] += 1
      if message["sender"] == "human"
        active_date = message_time.to_date.iso8601
        monthly_bucket["activeDays"] << active_date
        weekly_bucket["activeDays"] << active_date
      end
    end
  end

  conversation_source = {
    "fileName" => File.basename(options[:conversations]),
    "usersFileName" => File.basename(options[:users]),
    "period" => conversation_dates.empty? ? "데이터 없음" : "#{conversation_dates.min.to_date.iso8601} ~ #{conversation_dates.max.to_date.iso8601}",
    "conversationCount" => conversations.length,
    "messageCount" => message_count,
    "grain" => "conversation_and_message_timestamp",
  }
end

def serialize_activity(container)
  container.sort.to_h do |key, value|
    [
      key,
      value.merge("activeDays" => value["activeDays"].length),
    ]
  end
end

serialized_users = users.sort.map do |email, user|
  {
    "email" => email,
    "displayName" => DISPLAY_NAMES.fetch(email, email.split("@").first),
    "requests" => user["requests"],
    "promptTokens" => user["promptTokens"],
    "completionTokens" => user["completionTokens"],
    "totalTokens" => user["promptTokens"] + user["completionTokens"],
    "netSpendUsd" => user["netSpendUsd"].round(6),
    "grossSpendUsd" => user["grossSpendUsd"].round(6),
    "uncachedInputTokens" => user["uncachedInputTokens"],
    "cacheReadTokens" => user["cacheReadTokens"],
    "cacheWrite5mTokens" => user["cacheWrite5mTokens"],
    "cacheWrite1hTokens" => user["cacheWrite1hTokens"],
    "webSearchCount" => user["webSearchCount"],
    "products" => user["products"].sort,
    "models" => user["models"].sort,
    "productUsage" => user["productUsage"].sort.to_h,
    "modelUsage" => user["modelUsage"].sort.to_h,
    "monthlyCodeLines" => user["monthlyCodeLines"].sort.to_h,
    "monthlyActivity" => serialize_activity(user["monthlyActivity"]),
    "weeklyActivity" => serialize_activity(user["weeklyActivity"]),
  }
end

if options[:preserve_activity_revision]
  source = IO.popen(
    ["git", "show", "#{options[:preserve_activity_revision]}:src/data/individualUtilizationSnapshot.json"],
    &:read
  )
  abort "failed to read preserved activity snapshot" unless $?.success?

  preserved_snapshot = JSON.parse(source)
  preserved_by_email = preserved_snapshot.fetch("users").to_h { |user| [user.fetch("email"), user] }
  serialized_users.each do |user|
    preserved = preserved_by_email[user.fetch("email")]
    next unless preserved

    user["monthlyActivity"] = preserved.fetch("monthlyActivity", {})
    user["weeklyActivity"] = preserved.fetch("weeklyActivity", {})
  end
  conversation_source = preserved_snapshot.dig("source", "conversations")
end

totals = serialized_users.each_with_object({
  "users" => serialized_users.length,
  "requests" => 0,
  "promptTokens" => 0,
  "completionTokens" => 0,
  "totalTokens" => 0,
  "netSpendUsd" => 0.0,
  "grossSpendUsd" => 0.0,
  "codeLines" => code_sources.sum { |source| source["totalLines"] },
  "conversations" => 0,
  "humanPrompts" => 0,
  "assistantResponses" => 0,
}) do |user, memo|
  %w[requests promptTokens completionTokens totalTokens].each { |key| memo[key] += user[key] }
  memo["netSpendUsd"] += user["netSpendUsd"]
  memo["grossSpendUsd"] += user["grossSpendUsd"]
  user["weeklyActivity"].each_value do |activity|
    memo["conversations"] += activity["conversations"]
    memo["humanPrompts"] += activity["humanPrompts"]
    memo["assistantResponses"] += activity["assistantResponses"]
  end
end
totals["netSpendUsd"] = totals["netSpendUsd"].round(6)
totals["grossSpendUsd"] = totals["grossSpendUsd"].round(6)

snapshot = {
  "source" => {
    "generatedAt" => Time.now.getlocal("+09:00").iso8601,
    "spend" => {
      "fileName" => options[:spend].map { |path| File.basename(path) }.join(" + "),
      "period" => options[:spend_period] || "조회 기간 미지정",
      "rowCount" => spend_rows,
      "grain" => "user_product_model_period_sum",
    },
    "codeLines" => code_sources,
    "conversations" => conversation_source,
    "notes" => [
      "Spend report는 주차별 사용자·제품·모델 기간 합계이며 월 누적은 주차 파일을 더해 계산합니다.",
      "Code Lines는 월 누적 스냅샷의 최신 파일을 월 누적값으로 사용하고 주차 값은 스냅샷 간 순증으로 계산합니다.",
      "주간 활동은 Claude 대화 원천의 대화·메시지 타임스탬프만 사용합니다.",
    ],
  },
  "totals" => totals,
  "users" => serialized_users,
}

File.write(options[:output], JSON.pretty_generate(snapshot) + "\n")
puts "Wrote #{options[:output]} (#{serialized_users.length} users, #{spend_rows} spend rows)"
