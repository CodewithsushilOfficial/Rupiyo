import { env } from '@/lib/config/env';

/**
 * Deterministic rule-based fallback generator if NVIDIA NIM API is unavailable.
 */
export function generateRuleBasedInsight(telemetry) {
  const { totalIncome = 0, totalExpense = 0, savingsRate = 0, topCategory = 'General' } = telemetry;
  const netSavings = totalIncome - totalExpense;

  let title = 'Financial Stability Check';
  let summary = 'Your monthly cash flow appears balanced.';
  let type = 'TIP';
  let score = 75;
  const recommendations = [];

  if (savingsRate < 20) {
    type = 'WARNING';
    title = 'Low Savings Rate Alert';
    summary = `Your current savings rate is ${savingsRate}%, which is below the recommended 20% benchmark.`;
    recommendations.push(`Review your top spending category: ${topCategory}.`);
    recommendations.push('Create budget caps for discretionary non-essential purchases.');
    score = 55;
  } else if (savingsRate >= 40) {
    type = 'ACHIEVEMENT';
    title = 'Outstanding Savings Performance';
    summary = `Fantastic job! You saved ${savingsRate}% of your income this month (₹${netSavings.toLocaleString('en-IN')}).`;
    recommendations.push('Consider allocating surplus savings into long-term investments or emergency goals.');
    recommendations.push('Keep up your current budgeting discipline.');
    score = 92;
  } else {
    recommendations.push(`Monitor your ${topCategory} expenses closely next month.`);
    recommendations.push('Build an emergency fund covering 6 months of essential expenses.');
  }

  return {
    title,
    summary,
    type,
    score,
    recommendations,
    generatedBy: 'DETERMINISTIC_RULE_FALLBACK',
  };
}

/**
 * Invokes NVIDIA NIM AI API (meta/llama-3.1-70b-instruct) with 8-second timeout & fallback.
 */
export async function generateNvidiaNimInsight(telemetry) {
  const apiKey = env.NVIDIA_NIM_API_KEY;
  const baseUrl = env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const model = env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-70b-instruct';
  const timeoutMs = env.NVIDIA_NIM_TIMEOUT_MS || 8000;

  if (!apiKey || apiKey.includes('your-nvidia')) {
    console.warn('⚠️ NVIDIA NIM API key missing or default placeholder. Using deterministic fallback.');
    return generateRuleBasedInsight(telemetry);
  }

  const prompt = `You are Rupiyo's Expert Personal Finance Advisor. Analyze the user's financial telemetry and respond ONLY with valid JSON.

USER TELEMETRY:
- Monthly Income: ₹${telemetry.totalIncome}
- Monthly Expenses: ₹${telemetry.totalExpense}
- Net Savings: ₹${telemetry.netSavings}
- Savings Rate: ${telemetry.savingsRate}%
- Top Expense Category: ${telemetry.topCategory} (₹${telemetry.topCategoryAmount})
- Active Budget Warnings: ${telemetry.overBudgetCategories?.join(', ') || 'None'}

Return ONLY a JSON object with this exact structure (no markdown formatting, no code blocks):
{
  "title": "Short Catchy Insight Title",
  "summary": "2-3 sentence executive financial assessment",
  "type": "TIP" | "WARNING" | "ACHIEVEMENT" | "ANOMALY",
  "score": number between 0 and 100,
  "recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ NVIDIA NIM API Error (${response.status}):`, errText);
      return generateRuleBasedInsight(telemetry);
    }

    const json = await response.json();
    const rawContent = json.choices?.[0]?.message?.content?.trim() || '';

    // Sanitize JSON markdown wrapping if model includes ```json ... ```
    const cleanContent = rawContent
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(cleanContent);

    return {
      title: parsed.title || 'AI Financial Assessment',
      summary: parsed.summary || 'Analysis complete.',
      type: parsed.type || 'TIP',
      score: Number(parsed.score) || 75,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      generatedBy: 'NVIDIA_NIM_LLAMA_3.1_70B',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('⏱️ NVIDIA NIM API request timed out (8s limit). Falling back.');
    } else {
      console.error('❌ NVIDIA NIM fetch exception:', err);
    }
    return generateRuleBasedInsight(telemetry);
  }
}
