
import { GoogleGenAI } from "@google/genai";
import { Order, Expense, MenuItem } from "../types";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getBusinessInsights(orders: Order[], expenses: Expense[], menu: MenuItem[]) {
  try {
    const summary = {
      totalSales: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      orderCount: orders.length,
      topItems: menu.sort((a, b) => b.stock - a.stock).slice(0, 3).map(i => i.name),
      lowStock: menu.filter(i => i.stock < 10).map(i => i.name)
    };

    const prompt = `
      As a restaurant business consultant, analyze this data and provide 3 short, actionable insights in a JSON array of strings. 
      Data: 
      Total Sales: INR ${summary.totalSales}
      Total Expenses: INR ${summary.totalExpenses}
      Total Orders: ${summary.orderCount}
      Low Stock Items: ${summary.lowStock.join(', ')}
      
      Focus on profitability, inventory management, and operational efficiency for an Indian cafe.
      Return ONLY a JSON array of 3 strings.
    `;

    // Correctly call generateContent with specified model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Extract text directly from property, following guidelines
    const text = response.text || "[]";
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText) as string[];
  } catch (error) {
    console.error("AI Insight Error:", error);
    return [
      "Keep tracking your daily sales to build more data for AI analysis.",
      "Monitor items like " + (menu[0]?.name || "dishes") + " for better margin management.",
      "Consider regular stock audits for low-inventory items."
    ];
  }
}
