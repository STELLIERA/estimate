"use client";

import { useMemo, useState } from "react";

type QuestionId =
  | "productionPlan"
  | "purpose"
  | "pages"
  | "siteStatus"
  | "updates"
  | "content"
  | "features"
  | "maintenance"
  | "materials";

type Choice = {
  value: string;
  label: string;
  description: string;
};

type Question = {
  id: QuestionId;
  title: string;
  description: string;
  type: "single" | "multiple";
  choices: Choice[];
};

type Answer = string | string[];
type Answers = Partial<Record<QuestionId, Answer>>;

type PriceLine = {
  id: string;
  label: string;
  amount: number | null;
  included?: boolean;
};

type Estimate = {
  basePrice: number | null;
  optionLines: PriceLine[];
  optionTotal: number;
  total: number | null;
  monthlyPrice: number | null;
  monthlyLabel: string | null;
  needsCustomQuote: boolean;
};

const questions: Question[] = [
  {
    id: "productionPlan",
    title: "どの制作内容をご希望ですか？",
    description: "料金の目安を計算するために選んでください。",
    type: "single",
    choices: [
      { value: "design", label: "デザインのみ", description: "デザインデータを納品" },
      { value: "coding-static", label: "静的サイトのコーディングのみ", description: "HTML・CSS・JavaScriptで制作" },
      { value: "coding-wordpress", label: "WordPressのコーディングのみ", description: "コーディング料金にWordPress基本料金1万円を追加" },
      { value: "design-coding-static", label: "デザイン＋静的サイト制作", description: "更新頻度が少ないサイト向け" },
      { value: "design-coding-wordpress", label: "デザイン＋WordPress制作", description: "WordPressで自分で更新できるサイト" },
    ],
  },
  {
    id: "purpose",
    title: "どんなサイトを作りたいですか？",
    description: "いちばん近いものを選んでください。",
    type: "single",
    choices: [
      { value: "company", label: "会社・お店の紹介", description: "事業内容や店舗情報を伝えたい" },
      { value: "service", label: "サービスの集客", description: "特定のサービスや商品の魅力を伝えたい" },
      { value: "portfolio", label: "作品・実績の紹介", description: "制作物や活動内容を見せたい" },
      { value: "recruit", label: "採用サイト", description: "会社の雰囲気や求人情報を届けたい" },
      { value: "other", label: "まだ決まっていない", description: "相談しながら方向性を決めたい" },
    ],
  },
  {
    id: "pages",
    title: "ページ数はどのくらいを想定していますか？",
    description: "料金表に合わせたページ数です。トップページを含みます。",
    type: "single",
    choices: [
      { value: "1", label: "1ページ", description: "トップページのみ" },
      { value: "4", label: "4ページ", description: "トップページ＋下層3ページ" },
      { value: "6", label: "6ページ", description: "トップページ＋下層5ページ" },
      { value: "11", label: "11ページ", description: "トップページ＋下層10ページ" },
      { value: "other", label: "その他のページ数", description: "料金表にないページ数は個別見積もり" },
      { value: "unknown", label: "まだ分からない", description: "必要なページを一緒に整理したい" },
    ],
  },
  {
    id: "siteStatus",
    title: "現在のサイト状況を教えてください",
    description: "既存サイト向けのオプションを案内するために使います。",
    type: "single",
    choices: [
      { value: "new", label: "新しくサイトを作る", description: "現在のサイトはない" },
      { value: "existing-static", label: "既存の静的サイトがある", description: "HTMLなどで作られたサイトがある" },
      { value: "existing-wordpress", label: "既存のWordPressサイトがある", description: "WordPressサイトの修正などを相談したい" },
      { value: "unknown", label: "分からない／相談したい", description: "現在のサイトの状態を確認してほしい" },
    ],
  },
  {
    id: "updates",
    title: "公開後の更新はどのようにしたいですか？",
    description: "更新方法に合わせて、サイトの作り方をご案内します。",
    type: "single",
    choices: [
      { value: "provider", label: "更新は制作側に依頼したい", description: "更新を都度お願いする" },
      { value: "news", label: "お知らせやブログを自分で更新したい", description: "記事を追加・編集できる仕組みがほしい" },
      { value: "content", label: "ページの文章や画像も自分で更新したい", description: "サイトの内容を自分で管理したい" },
      { value: "unknown", label: "まだ決めていない", description: "更新頻度や方法から相談したい" },
    ],
  },
  {
    id: "content",
    title: "サイトに掲載したい内容を選んでください",
    description: "複数選択できます。ページ数に含めて考えます。",
    type: "multiple",
    choices: [
      { value: "faq", label: "よくある質問", description: "よくある質問と回答をまとめて掲載する" },
      { value: "works", label: "実績・施工事例", description: "写真や説明とともに実績を掲載する" },
      { value: "company", label: "会社概要", description: "会社情報や事業内容、所在地などを掲載する" },
      { value: "service", label: "サービス・商品紹介", description: "提供内容や料金、商品の特徴を掲載する" },
      { value: "access", label: "アクセス情報", description: "住所、営業時間、地図などを掲載する" },
      { value: "news", label: "お知らせ・ブログ", description: "新着情報や記事を掲載する" },
      { value: "none", label: "特にない／相談したい", description: "必要な掲載内容を一緒に考える" },
    ],
  },
  {
    id: "features",
    title: "追加したい機能・オプションを選んでください",
    description: "複数選択できます。料金はそれぞれ最低料金の目安です。",
    type: "multiple",
    choices: [
      { value: "contact", label: "お問い合わせフォーム", description: "用途に合わせた専用フォームを設置（1箇所）" },
      { value: "booking", label: "予約・申し込み", description: "機能や仕様により個別見積もり" },
      { value: "payment", label: "決済機能", description: "機能や仕様により料金が変動" },
      { value: "mapSns", label: "Googleマップ・SNS連携", description: "用途に合わせて設置" },
      { value: "seoOgp", label: "SEO初期対策・OGP設定", description: "メタタグやSNSシェア画像を設定" },
      { value: "animation", label: "アニメーション実装", description: "表示時のアニメーションなど" },
      { value: "customPost", label: "追加カスタム投稿", description: "WordPress基本プランの1点を超えて追加する場合" },
      { value: "customField", label: "カスタムフィールド追加", description: "ACFなどで入力項目を追加（1項目〜）" },
      { value: "minorEdit", label: "既存ページの軽微な修正", description: "テキスト・画像・URLなど（既存サイト向け）" },
      { value: "majorEdit", label: "既存ページの大幅な修正", description: "構成・レイアウトなど（既存サイト向け）" },
      { value: "staticToWordPress", label: "既存静的サイトのWordPress化", description: "既存の静的サイトをWordPress化" },
      { value: "none", label: "特にない／相談したい", description: "必要なオプションを一緒に考える" },
    ],
  },
  {
    id: "maintenance",
    title: "月額保守・運用サポートは必要ですか？",
    description: "初期制作費とは別に、月額料金として表示します。",
    type: "single",
    choices: [
      { value: "none", label: "今は必要ない", description: "月額保守を申し込まない" },
      { value: "support", label: "月額保守・運用サポート", description: "管理代行、定期バックアップ、簡易修正（月1回まで）" },
      { value: "wordpressSafety", label: "WordPress安全運用プラン", description: "本体・プラグイン更新、バックアップ、セキュリティ監視" },
    ],
  },
  {
    id: "materials",
    title: "文章や写真などの素材はありますか？",
    description: "準備状況に近いものを選んでください。",
    type: "single",
    choices: [
      { value: "ready", label: "文章・写真ともに用意できる", description: "掲載内容と素材がそろっている" },
      { value: "partial", label: "一部はあるが、準備を手伝ってほしい", description: "文章や写真の整理を相談したい" },
      { value: "need", label: "文章や写真の用意から相談したい", description: "何を準備すればよいか分からない" },
    ],
  },
];

const optionPrices: Record<string, { label: string; amount: number }> = {
  contact: { label: "お問い合わせフォーム", amount: 10_000 },
  payment: { label: "決済機能", amount: 30_000 },
  mapSns: { label: "Googleマップ・SNS連携", amount: 3_000 },
  seoOgp: { label: "SEO初期対策・OGP設定", amount: 7_000 },
  animation: { label: "アニメーション実装", amount: 5_000 },
  customPost: { label: "追加カスタム投稿", amount: 15_000 },
  customField: { label: "カスタムフィールド追加（1項目分）", amount: 3_000 },
  minorEdit: { label: "既存ページの軽微な修正", amount: 3_000 },
  majorEdit: { label: "既存ページの大幅な修正", amount: 15_000 },
  staticToWordPress: { label: "既存静的サイトのWordPress化", amount: 30_000 },
  blog: { label: "自分で更新できるブログ・お知らせ", amount: 10_000 },
};

const emptyAnswers: Answers = {};

function getBasePrice(plan: Answer | undefined, pages: Answer | undefined): number | null {
  if (typeof plan !== "string" || typeof pages !== "string") return null;

  const pageCount = Number(pages);
  if (!Number.isInteger(pageCount) || pageCount < 1) return null;

  switch (plan) {
    case "design":
      return 30_000 + (pageCount - 1) * 8_000;
    case "coding-static":
      return 50_000 + (pageCount - 1) * 12_000;
    case "coding-wordpress":
      return 50_000 + 10_000 + (pageCount - 1) * 12_000;
    case "design-coding-static":
      if (pageCount === 1) return 70_000;
      if (pageCount === 4) return 100_000;
      if (pageCount === 6) return 120_000;
      if (pageCount === 11) return 120_000 + (11 - 6) * 15_000;
      return null;
    case "design-coding-wordpress":
      if (pageCount === 1) return 100_000;
      if (pageCount === 4) return 130_000;
      if (pageCount === 6) return 180_000;
      if (pageCount === 11) return 280_000;
      return null;
    default:
      return null;
  }
}

function getEstimate(answers: Answers): Estimate {
  const plan = typeof answers.productionPlan === "string" ? answers.productionPlan : "";
  const selectedFeatures = Array.isArray(answers.features) ? answers.features : [];
  const isFullWordPressPlan = plan === "design-coding-wordpress";
  const isExistingSite =
    answers.siteStatus === "existing-static" ||
    answers.siteStatus === "existing-wordpress" ||
    answers.siteStatus === "unknown";

  const optionLines: PriceLine[] = [];
  let needsCustomQuote = false;

  for (const featureId of selectedFeatures) {
    if (featureId === "none") continue;

    if (featureId === "booking") {
      optionLines.push({ id: featureId, label: "予約・申し込み", amount: null });
      needsCustomQuote = true;
      continue;
    }

    if ((featureId === "minorEdit" || featureId === "majorEdit") && !isExistingSite) {
      continue;
    }

    if (featureId === "staticToWordPress" && answers.siteStatus !== "existing-static") {
      continue;
    }

    if (featureId === "contact" && isFullWordPressPlan) {
      optionLines.push({ id: featureId, label: "お問い合わせフォーム", amount: 0, included: true });
      continue;
    }

    const option = optionPrices[featureId];
    if (option) {
      optionLines.push({ id: featureId, label: option.label, amount: option.amount });
    }
  }

  // 「自分で更新できるお知らせ・ブログ」を希望した場合の初期設定費
  if (answers.updates === "news") {
    optionLines.push({ id: "blog", label: optionPrices.blog.label, amount: optionPrices.blog.amount });
  }

  if (isFullWordPressPlan) {
    optionLines.push({ id: "includedCustomPost", label: "カスタム投稿1点", amount: 0, included: true });
  }

  const optionTotal = optionLines.reduce((total, line) => total + (line.amount ?? 0), 0);
  const basePrice = getBasePrice(answers.productionPlan, answers.pages);
  if (basePrice === null) needsCustomQuote = true;

  const isWordPressPlan = plan.includes("wordpress");
  if ((answers.updates === "news" || answers.updates === "content") && !isWordPressPlan) {
    needsCustomQuote = true;
  }

  const maintenanceChoice = answers.maintenance;
  let monthlyPrice: number | null = null;
  let monthlyLabel: string | null = null;

  if (maintenanceChoice === "support") {
    monthlyPrice = 5_000;
    monthlyLabel = "月額保守・運用サポート";
  } else if (maintenanceChoice === "wordpressSafety" && plan.includes("wordpress")) {
    monthlyPrice = 8_000;
    monthlyLabel = "WordPress安全運用プラン";
  }

  return {
    basePrice,
    optionLines,
    optionTotal,
    total: basePrice === null ? null : basePrice + optionTotal,
    monthlyPrice,
    monthlyLabel,
    needsCustomQuote,
  };
}

function yen(amount: number): string {
  return `¥${amount.toLocaleString()}〜`;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [copied, setCopied] = useState(false);
  const isResult = step === questions.length;
  const current = questions[step];
  const progress = isResult ? 100 : Math.round((step / questions.length) * 100);

  const summary = useMemo(
    () =>
      questions.map((question) => {
        const selected = answers[question.id];
        const values = Array.isArray(selected) ? selected : selected ? [selected] : [];
        const labels = values
          .map((value) => question.choices.find((choice) => choice.value === value)?.label)
          .filter((label): label is string => Boolean(label));
        return { question: question.title, answer: labels.length ? labels.join("、") : "未選択" };
      }),
    [answers],
  );

  const estimate = getEstimate(answers);

  const productionPlan =
    typeof answers.productionPlan === "string"
      ? answers.productionPlan
      : "";

  let portfolioDiscountMessage = "";

  if (answers.siteStatus === "new") {
    if (productionPlan === "design") {
      portfolioDiscountMessage =
        "実績掲載にご協力いただける場合、制作費から5,000円割引します。";
    } else if (
      [
        "coding-static",
        "coding-wordpress",
        "design-coding-static",
        "design-coding-wordpress",
      ].includes(productionPlan)
    ) {
      portfolioDiscountMessage =
        "静的サイト・WordPressの新規制作は、実績掲載にご協力いただける場合、制作費から10,000円割引します。";
    }
  }
  const selectedValues = current ? answers[current.id] : undefined;

  const visibleChoices = current
    ? current.choices.filter((choice) => {
        if (current.id === "features") {
          const existingOnly = ["minorEdit", "majorEdit"];
          if (existingOnly.includes(choice.value) && answers.siteStatus === "new") return false;
          if (choice.value === "staticToWordPress" && answers.siteStatus !== "existing-static") return false;
        }

        if (current.id === "maintenance" && choice.value === "wordpressSafety") {
          const plan = answers.productionPlan;
          if (typeof plan !== "string" || !plan.includes("wordpress")) return false;
        }

        return true;
      })
    : [];

  function choose(value: string) {
    if (!current) return;

    setAnswers((previous) => {
      if (current.id === "siteStatus") {
        const selectedFeatures = Array.isArray(previous.features) ? previous.features : [];
        const keptFeatures = selectedFeatures.filter((feature) => {
          if (value === "new" && ["minorEdit", "majorEdit", "staticToWordPress"].includes(feature)) return false;
          if (value !== "existing-static" && feature === "staticToWordPress") return false;
          return true;
        });
        return { ...previous, siteStatus: value, features: keptFeatures };
      }

      if (current.id === "productionPlan") {
        const nextAnswers = { ...previous, productionPlan: value };
        if (!value.includes("wordpress") && previous.maintenance === "wordpressSafety") {
          nextAnswers.maintenance = "none";
        }
        return nextAnswers;
      }

      if (current.type === "single") {
        return { ...previous, [current.id]: value };
      }

      const selected = Array.isArray(previous[current.id]) ? previous[current.id] as string[] : [];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected.filter((item) => item !== "none"), value];

      if (value === "none") {
        return { ...previous, [current.id]: next.includes(value) ? [value] : [] };
      }

      return { ...previous, [current.id]: next };
    });
  }

  function next() {
    if (current && answers[current.id] !== undefined) {
      setStep((value) => value + 1);
    }
  }

  function getInquiryText() {
    const priceDetails = [
      `基本料金：${estimate.basePrice === null ? "個別見積もり" : yen(estimate.basePrice)}`,
      ...estimate.optionLines.map((line) => {
        if (line.included) return `${line.label}：基本プランに含む`;
        return `${line.label}：${line.amount === null ? "個別見積もり" : yen(line.amount)}`;
      }),
      `初期費用の目安：${estimate.total === null ? "個別見積もり" : yen(estimate.total)}`,
      estimate.monthlyLabel && estimate.monthlyPrice !== null
        ? `${estimate.monthlyLabel}：${yen(estimate.monthlyPrice)}／月`
        : "月額保守：選択なし",
    ];

    return [
      "ホームページ制作の相談内容",
      ...summary.map((item) => `${item.question}\n${item.answer}`),
      "料金の目安",
      ...priceDetails,
    ].join("\n\n");
  }

  function getGoogleFormUrl() {
    const url = new URL(
      "https://docs.google.com/forms/d/e/1FAIpQLSfJF56JJ8KCRfzFVyXcwCypxoz-n1Z9DWqGvMsGznfIDbAatw/viewform?usp=pp_url",
    );
    url.searchParams.set("entry.325224663", getInquiryText());
    return url.toString();
  }

  function copySummary() {
    void navigator.clipboard.writeText(getInquiryText()).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    });
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  return (
    <main className="estimator-page">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="studio flow ホーム">
          <span className="brand-mark">s</span>
          <span>料金シミュレーター</span>
        </a>
        <span className="header-note">ホームページ制作のご相談</span>
      </header>

      <section className="estimator-shell" id="top">
        <div className="intro-column">
          <p className="eyebrow">WEBSITE PLANNER</p>
          <h1>希望に合った制作内容と<br />料金の目安をチェック</h1>
          <p className="intro-copy">
            いくつかの質問に答えるだけで、必要な内容と料金の目安を整理できます。
            まだ決まっていない項目は「相談したい」を選んでください。
          </p>
          <div className="time-note"><span className="clock-icon">◷</span> 目安時間 2〜3分</div>
          <div className="help-card">
            <span className="help-icon">i</span>
            <p>選んだ内容は最後に相談メモとしてまとめられます。<br />この時点では送信されません。</p>
          </div>
        </div>

        <div className="question-card">
          <div className="card-topline">
            <span>{isResult ? "回答のまとめ" : `QUESTION ${String(step + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track"><div className="progress-value" style={{ width: `${progress}%` }} /></div>

          {!isResult && current ? (
            <>
              <div className="question-heading">
                <h2>{current.title}</h2>
                <p>{current.description}</p>
              </div>
              <div className="choices-list">
                {visibleChoices.map((choice) => {
                  const active = Array.isArray(selectedValues)
                    ? selectedValues.includes(choice.value)
                    : selectedValues === choice.value;
                  return (
                    <button
                      className={`choice ${active ? "choice-selected" : ""}`}
                      type="button"
                      key={choice.value}
                      aria-pressed={active}
                      onClick={() => choose(choice.value)}
                    >
                      <span className={`choice-indicator ${current.type === "multiple" ? "checkbox" : ""}`}>
                        {active ? "✓" : ""}
                      </span>
                      <span className="choice-text">
                        <strong>{choice.label}</strong>
                        <small>{choice.description}</small>
                      </span>
                      <span className="choice-arrow">›</span>
                    </button>
                  );
                })}
              </div>
              {current.type === "multiple" && <p className="selection-hint">複数選択できます</p>}
              <div className="card-actions">
                <button className="back-button" type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>← 戻る</button>
                <button
                  className="next-button"
                  type="button"
                  onClick={next}
                  disabled={selectedValues === undefined || (Array.isArray(selectedValues) && selectedValues.length === 0)}
                >
                  {step === questions.length - 1 ? "回答を確認する" : "次へ進む"}<span>→</span>
                </button>
              </div>
            </>
          ) : (
            <div className="result-content">
              <h2>ご希望を整理しました</h2>
              <p className="result-lead">回答内容と料金の内訳を確認してください。フォームにも引き継げます。</p>

              <dl className="summary-list">
                {summary.map((item) => (
                  <div className="summary-row" key={item.question}>
                    <dt>{item.question}</dt><dd>{item.answer}</dd>
                  </div>
                ))}
              </dl>

              <section className="estimate-box" aria-label="料金の目安">
                <h3>料金の目安</h3>

                <div className="estimate-line">
                  <span>基本料金</span>
                  <strong>
                    {estimate.basePrice === null
                      ? "個別見積もり"
                      : yen(estimate.basePrice)}
                  </strong>
                </div>

                {estimate.optionLines.map((line) => (
                  <div className="estimate-line" key={line.id}>
                    <span>
                      {line.label}
                      {line.included ? "（基本プランに含む）" : ""}
                    </span>
                    <strong>
                      {line.included
                        ? "含む"
                        : line.amount === null
                          ? "個別見積もり"
                          : yen(line.amount)}
                    </strong>
                  </div>
                ))}

                <div className="estimate-line estimate-subtotal">
                  <span>有料オプション小計</span>
                  <strong>{yen(estimate.optionTotal)}</strong>
                </div>

                <div className="estimate-line estimate-total">
                  <span>初期費用の目安</span>
                  <strong>
                    {estimate.total === null
                      ? "個別見積もり"
                      : yen(estimate.total)}
                  </strong>
                </div>

                {portfolioDiscountMessage && (
                  <p className="estimate-note">
                    {portfolioDiscountMessage}
                    <br />
                    表示金額は割引適用前です。割引は実績掲載にご協力いただける場合に適用します。
                  </p>
                )}

                {estimate.monthlyLabel && estimate.monthlyPrice !== null && (
                  <div className="estimate-line estimate-monthly">
                    <span>{estimate.monthlyLabel}</span>
                    <strong>{yen(estimate.monthlyPrice)}／月</strong>
                  </div>
                )}

                {estimate.needsCustomQuote && (
                  <p className="estimate-note">
                    ページ構成や予約機能など、選択内容によって個別のお見積もりが必要です。
                  </p>
                )}

                <p className="estimate-note">
                  表示金額は料金表に基づく最低料金の目安です。正式な金額は内容確認後にご案内します。
                </p>
              </section>

              <div className="result-actions">
                <a className="next-button copy-button" href={getGoogleFormUrl()} target="_blank" rel="noopener noreferrer">
                  Googleフォームで問い合わせる<span>↗</span>
                </a>
                <button className="back-button restart-button" type="button" onClick={copySummary}>
                  {copied ? "相談内容をコピーしました ✓" : "相談内容をコピー"}
                </button>
                <button className="back-button restart-button" type="button" onClick={restart}>最初からやり直す</button>
              </div>
            </div>
          )}
        </div>
      </section>
      <footer className="site-footer"><span>studio flow</span><span>あなたの事業に合ったWebサイトづくりを。</span></footer>
    </main>
  );
}
