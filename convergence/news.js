window.NEWS_ASOF = "2026-09-14";
window.NEWS_STORY = {
  title:"A church chatbot, a papal encyclical, and a fight over whether a voice can teach",
  when:"Late August–mid September 2026",
  source:"The Economist, 27 Aug 2026; National Catholic Register, 20 Aug 2026; Georgetown, 9 Sep 2026",
  what:"Magisterium AI, a Catholic-trained chatbot, now claims millions of users. In the same weeks a Catholic anti-AI current is organizing, reading Pope Leo XIV’s encyclical Magnifica Humanitas (May 2026) as a call to refuse the tool. Leo has not banned chatbots. He has said AI can be a valuable tool if watched; priests should not let it write the homily; children should not take a chatbot as a friend or as an oracle. The same season he joked that the machine still thought Francis was pope.",
  href:"https://www.economist.com/international/2026/08/27/ai-is-changing-religion-and-religions-are-trying-to-change-ai"
};
window.NEWS_READ = {
  christianity:{
    g1:"Grain 1 — the family. The creeds already said the Judge is a person who rose. A useful index of documents is not a coming. A homily written by a tool is still a homily someone has to answer for.",
    g2:"Grain 2 — Catholic / Protestant. Rome can point at an encyclical and at a curating team. A PCA session cannot. Both still have to say whether the voice is a servant of the text or a rival pulpit.",
    g3:"Grain 3 — rooms. Catholic official: public revelation is closed; Magisterium AI is at best a library. Anti-AI Catholics: prudence means refusal. PCA: ordinary means; the chatbot is not Word, sacrament, or prayer. Sproul: a judgment-coming already happened in AD 70; that does not make this product the final coming. Pentecostal: test the spirit. Seeker room: the risk is production feeling like presence."
  },
  islam:{
    g1:"Grain 1 — the family. Tawhid. A voice that answers as if it knew the unseen sits near shirk. The Hour is not scheduled by a product launch.",
    g2:"Grain 2 — Sunni / Shia. Shared: Isa returns; Dajjal works wonders. Split: whether the Mahdi is already alive and hidden.",
    g3:"Grain 3 — Hanafi and Shafi‘i treat this as law and caution, not a new calendar. Salafi rooms ask whether the wonders ask for worship. Twelver rooms already live in occultation; a machine is not the twelfth Imam."
  },
  hindu:{
    g1:"Grain 1 — families, not one church. A chatbot reciting Gita lines is still not a guru with a lineage.",
    g2:"Grain 2 — Vaishnava / Shaiva. Different names at the center. Same test: does the tool accelerate craving in a darkening age?",
    g3:"Grain 3 — a sampradaya has a living teacher-line. A model has logs."
  },
  unaffiliated:{
    g1:"Grain 1 — no revealed clock. The story is about who holds the corpus and the compute.",
    g2:"Grain 2 — atheist / agnostic / nothing-in-particular. The first asks whether the claim can fail.",
    g3:"Grain 3 — a finished-world promise from a machine is a forecast. Treat it as one."
  },
  science:{
    g1:"Grain 1 — method. The encyclical is not a paper. The chatbot is not a finding.",
    g2:"Grain 2 — method-only vs worldview.",
    g3:"Grain 3 — if someone says a threshold has been crossed, the claim must still be able to fail."
  }
};
window.fetchNewsHeadlines = async function(){
  var q="https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent("https://news.google.com/rss/search?q=Pope+Leo+AI+OR+religion+artificial+intelligence&hl=en-US&gl=US&ceid=US:en");
  try{
    var r=await fetch(q);
    var j=await r.json();
    if(!j.items) return [];
    return j.items.slice(0,4).map(function(it){ return {title:it.title, href:it.link, when:(it.pubDate||"").slice(0,16)}; });
  }catch(e){ return []; }
};
