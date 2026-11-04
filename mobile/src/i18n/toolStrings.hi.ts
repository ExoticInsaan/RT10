// Hindi lines for the shared tool screens. The key is the exact English sentence used in the tool's code.
// {name} parts are filled in by the tool, and <b>…</b> marks bold text. A sentence missing here shows in English.
export const toolStringsHi: Record<string, string> = {
  // Attendance calculator
  "Enter the classes you attended and the classes held so far.": "आपने जितनी क्लास अटेंड कीं और अब तक जितनी क्लास हुईं, वो डालें।",
  "Use whole numbers, with at least one class held.": "पूरे अंक डालें, और कम से कम एक क्लास हुई होनी चाहिए।",
  "You can't have attended more classes than were held.": "आप जितनी क्लास हुईं, उनसे ज़्यादा अटेंड नहीं कर सकते।",
  "The target should be between 1% and 100%.": "टारगेट 1% से 100% के बीच होना चाहिए।",
  "Your attendance right now": "अभी आपकी अटेंडेंस",
  "You can miss the next <b>{n}</b> class and still stay at or above {target}. Miss one more and you drop to {after}.":
    "आप अगली <b>{n}</b> क्लास छोड़ सकते हैं और फिर भी {target} या उससे ऊपर रहेंगे। एक और छोड़ी तो आप {after} पर आ जाएँगे।",
  "You can miss the next <b>{n}</b> classes and still stay at or above {target}. Miss one more and you drop to {after}.":
    "आप अगली <b>{n}</b> क्लास छोड़ सकते हैं और फिर भी {target} या उससे ऊपर रहेंगे। एक और छोड़ी तो आप {after} पर आ जाएँगे।",
  "You are right at the line. Missing even the next class takes you to {after}.": "आप ठीक सीमा पर हैं। अगली क्लास भी छोड़ी तो आप {after} पर आ जाएँगे।",
  "A 100% target can't be reached once a class has been missed.": "एक भी क्लास छूटने के बाद 100% का टारगेट पूरा नहीं हो सकता।",
  "Attend the next <b>{n}</b> class in a row to reach {target}. That brings you to {after}.":
    "{target} तक पहुँचने के लिए लगातार अगली <b>{n}</b> क्लास अटेंड करें। इससे आप {after} पर पहुँच जाएँगे।",
  "Attend the next <b>{n}</b> classes in a row to reach {target}. That brings you to {after}.":
    "{target} तक पहुँचने के लिए लगातार अगली <b>{n}</b> क्लास अटेंड करें। इससे आप {after} पर पहुँच जाएँगे।",
  "With no classes left, your final attendance is {current}.": "कोई क्लास बाकी नहीं है, इसलिए आपकी फ़ाइनल अटेंडेंस {current} है।",
  "Even if you attend all {n} remaining classes, you finish at {best}, below {target}. Ask your department about condonation early.":
    "बाकी सभी {n} क्लास अटेंड करने पर भी आप {best} पर खत्म करेंगे, जो {target} से कम है। कंडोनेशन के बारे में अपने डिपार्टमेंट से जल्दी पूछ लें।",
  "With {n} classes left, attending all of them gets you to {best}. You can afford to miss <b>{skip}</b> of them and still finish at or above {target}.":
    "{n} क्लास बाकी हैं, सब अटेंड करने पर आप {best} पर पहुँचेंगे। इनमें से <b>{skip}</b> छोड़कर भी आप {target} या उससे ऊपर खत्म कर सकते हैं।",
  "Classes attended": "अटेंड की गई क्लास",
  "Classes held so far": "अब तक हुई क्लास",
  "Target attendance": "टारगेट अटेंडेंस",
  "Classes left this semester": "इस सेमेस्टर में बची क्लास",
  "75% is the most common rule.": "75% सबसे आम नियम है।",
  "Add this to see where you can finish.": "यह डालने पर पता चलेगा कि आप कहाँ तक पहुँच सकते हैं।",
  "Optional": "वैकल्पिक",
  "e.g. 42": "जैसे 42",
  "e.g. 60": "जैसे 60",
};
