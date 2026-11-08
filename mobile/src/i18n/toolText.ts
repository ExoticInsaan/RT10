import type { Tool } from "@/lib/tools/registry";
import { useLanguage } from "./LanguageProvider";

// Hindi names and one-line descriptions for the tools. The shared registry (also used by the website) stays English;
// this is a lookup that only the app reads. A tool without an entry here simply shows its English text.
const hi: Record<string, { name: string; description: string }> = {
  "pdf-toolkit": { name: "PDF टूलकिट", description: "अपने ब्राउज़र में ही PDF मर्ज, कंप्रेस, एडिट और कन्वर्ट करें, और पेज जोड़ें।" },
  "image-compressor": { name: "इमेज टूलकिट", description: "फ़ोटो को फ़ॉर्म में माँगे गए ठीक KB साइज़ तक कंप्रेस करें, या KB की सीमा के भीतर ठीक पिक्सल में रीसाइज़ करें।" },
  "focus-timer": { name: "फ़ोकस टाइमर", description: "छोटे ब्रेक के साथ फ़ोकस्ड सेशन में पढ़ाई करें।" },
  "flashcard-maker": { name: "फ़्लैशकार्ड मेकर", description: "अपने नोट्स को कार्ड में बदलें और याद होने तक खुद को टेस्ट करें।" },
  "cgpa-calculator": { name: "CGPA और प्रतिशत कैलकुलेटर", description: "CGPA या SGPA को प्रतिशत में बदलें और वापस भी, या अंकों से अपना प्रतिशत निकालें।" },
  "attendance-calculator": { name: "अटेंडेंस कैलकुलेटर", description: "75% से ऊपर रहने के लिए कितनी क्लास छोड़ सकते हैं या कितनी ज़रूर करनी हैं, देखें।" },
  reminder: { name: "रिमाइंडर", description: "असाइनमेंट, फ़ीस और डेडलाइन के रिमाइंडर लगाएँ ताकि कुछ छूटे नहीं।" },
  "days-countdown": { name: "डेज़ काउंटडाउन", description: "परीक्षा, ट्रिप या जन्मदिन में कितने दिन बचे हैं, गिनें।" },
  "decision-wheel": { name: "डिसीज़न व्हील", description: "चुन नहीं पा रहे? अपने विकल्प जोड़ें और व्हील को चुनने दें।" },
  "would-you-rather": { name: "वुड यू रादर", description: "दो नामुमकिन विकल्प, एक जवाब। एक चुनें और देखें बाकी क्या चुनते हैं।" },
  "grow-a-sapling": { name: "पौधा उगाओ", description: "रोज़ एक नन्हे पौधे को पानी दें और जब तक आपकी स्ट्रीक चलेगी, वह बढ़ता रहेगा।" },
  "friendship-score": { name: "फ़्रेंडशिप स्कोर", description: "कुछ सवालों में अपनी दोस्ती को रेट करें और दोस्त को भेजने के लिए कार्ड पाएँ।" },
  "what-am-i-to-you": { name: "मैं तुम्हारे लिए क्या हूँ?", description: "लिंक शेयर करें और जानें कि दोस्त आपको असल में कैसे देखते हैं।" },
  "how-well-do-you-know-me": { name: "तुम मुझे कितना जानते हो?", description: "अपने बारे में क्विज़ बनाएँ और देखें किस दोस्त का स्कोर सबसे ज़्यादा है।" },
  "how-cooked": { name: "आप कितने कुक्ड हैं?", description: "अपना बेहद वैज्ञानिक कैओस स्कोर पाएँ।" },
  "excuse-generator": { name: "बहाना जनरेटर", description: "अजीब-से-अजीब हालात के लिए ताज़ा बहाने।" },
  "roast-my-timetable": { name: "मेरे टाइमटेबल को रोस्ट करो", description: "क्योंकि आपका शेड्यूल ईमानदार फ़ीडबैक का हक़दार है।" },
  "vibe-check": { name: "इंस्टेंट वाइब चेक", description: "आज की एनर्जी की पूरी तरह निष्पक्ष रीडिंग।" },
};

export type ToolText = { name: string; description: string };

/** Returns a function that gives a tool's name and description in the chosen language. */
export function useToolText(): (tool: Tool) => ToolText {
  const { lang } = useLanguage();
  return (tool) => (lang === "hi" && hi[tool.id]) || { name: tool.name, description: tool.description };
}

/** True when the search text matches the tool in either language, so English searches still work in Hindi mode. */
export function matchesTool(tool: Tool, text: ToolText, query: string): boolean {
  return `${text.name} ${text.description} ${tool.name} ${tool.description}`.toLowerCase().includes(query);
}
