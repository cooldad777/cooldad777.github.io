/* Daily restamp: change NEWS_ASOF + NEWS_STORY + NEWS_READ. RSS below only adds raw headlines. Interpretations still need a human or a model pass. */
window.NEWS_ASOF = "2026-09-14";
window.NEWS_STORY = {
  title:"Bali and Rome: a tool must liberate, not enslave — and a chatbot is already teaching",
  when:"20 August – 9 September 2026",
  source:"Vatican News, 9 Sep 2026; National Catholic Register, 20 Aug 2026; The Economist, 27 Aug 2026",
  what:"Two rhymes in one month. In Bali (4–6 Sep) Scholas Occurrentes and the Dicastery for Interreligious Dialogue closed a congress on “Artificial Intelligence and Human Sense.” More than 200 people from 35 countries. The traveling line: stop asking only what the tools can do; ask what human beings want to do with them. They set it next to Leo XIV’s encyclical Magnifica humanitas (May 2026) and the Balinese Tri Hita Karana — people, place, the divine. Monsignor Indunil: education must move people from virtual connection to human communion. In the same weeks a Catholic-trained chatbot, Magisterium AI, is claiming millions of users, while a Catholic refusal current reads the same encyclical as grounds not to use the tool at all. Leo has not banned chatbots. He has said the tool can be valuable if watched; priests should not hand it the homily.",
  href:"https://www.vaticannews.va/en/church/news/2026-09/scholas-chairs-congress-ai-must-liberate-not-enslave.html"
};
window.NEWS_READ = {
  christianity:{
    g1:"Grain 1 — the family. The creeds already said the Judge is a person who rose. A congress and a chatbot are not the return. They are a fight over who gets to speak in the church’s voice, and whether a tool that writes is a servant of the text or a rival pulpit.",
    g2:"Grain 2 — Catholic / Protestant / Orthodox. Rome can point at an encyclical and send a dicastery to Bali. A PCA session cannot. Orthodox rooms will ask whether a faceless helper can be an icon. All three still have to say: communion is a people in a room, or it is not.",
    g3:"Grain 3 — rooms. Catholic official: public revelation is closed; Bali is pastoral application; Magisterium AI is at best a library. Anti-AI Catholics: prudence means refusal. PCA: ordinary means; the chatbot is not Word, sacrament, or prayer; Westminster 33.3 keeps the day unknown. Ligonier / Sproul: AD 70 was a real judgment-coming and still not the last one; this product is not that coming either. Pentecostal: test the spirit. Seeker room: production can start to feel like presence. Dispensational pew: an image that speaks is already in Revelation 13 — rhyme is still not a date."
  },
  islam:{
    g1:"Grain 1 — the family. Tawhid. A voice treated as knower-of-all sits near shirk. Bali’s line — liberate, not enslave — can be heard as that warning without becoming a fatwa. The Hour is not scheduled by a congress or a product launch.",
    g2:"Grain 2 — Sunni / Shia. Shared: Isa returns; Dajjal works wonders. Split: whether the Mahdi is already alive and hidden. Neither reading puts the twelfth Imam, or Hudhayfah’s ten signs, in Bali.",
    g3:"Grain 3 — Sunni Hour sequence: Dajjal literature is about wonders that ask for worship; a helpful congress is not that figure. Hanafi and Shafi‘i: law and caution, not a new calendar. Salafi: test wonders against tawhid; weak end-time stories stay weak. Twelver: occultation continues; a machine is not the twelfth Imam."
  },
  hindu:{
    g1:"Grain 1 — families, not one church. The meeting stood on Hindu-majority soil and named Tri Hita Karana. That is already a dharmic frame: people, place, the divine. A tool that speeds craving can still be read as weather of a darkening age. A chatbot reciting Gita lines is still not a guru with a lineage.",
    g2:"Grain 2 — Vaishnava / Shaiva. Different names at the center. Same test: does the tool restore dharma, or only accelerate desire? Gita 4.7 is still a person sending himself.",
    g3:"Grain 3 — a sampradaya has a living teacher-line. A model has logs. The Name is not a generated string. The temple has a threshold the feed does not."
  },
  unaffiliated:{
    g1:"Grain 1 — no revealed clock. The story is about who holds the corpus, the compute, and the claim to teach.",
    g2:"Grain 2 — atheist / agnostic / nothing-in-particular. The first asks whether the claim can fail. The third may use the tool and never join the fight.",
    g3:"Grain 3 — a finished-world promise from a machine is a forecast. Treat it as one."
  },
  science:{
    g1:"Grain 1 — method. An encyclical is not a paper. A chatbot is not a finding. Bali’s question — what do we want to do with it — is a values question, not a measurement.",
    g2:"Grain 2 — method-only vs worldview-naturalism. The first can use the tool and keep the claim falsifiable. The second is tempted to treat scale as destiny.",
    g3:"Grain 3 — if someone says a threshold has been crossed, the claim must still be able to fail."
  },
  jewish:{
    g1:"Grain 1 — covenant now. Do not finish redemption on a lab timetable. A tool that claims to complete repair is offering a false messiah in silicon.",
    g2:"Grain 2 — Orthodox / liberal. Law as binding vs ethics as peoplehood. Both can refuse a finished-world sales pitch.",
    g3:"Grain 3 — the Name is not a generated string here either."
  }
};
window.fetchNewsHeadlines = async function(){
  var q="https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent("https://news.google.com/rss/search?q=Pope+Leo+AI+OR+religion+artificial+intelligence+OR+Mahdi+OR+second+coming&hl=en-US&gl=US&ceid=US:en");
  try{
    var r=await fetch(q);
    var j=await r.json();
    if(!j.items) return [];
    return j.items.slice(0,4).map(function(it){ return {title:it.title, href:it.link, when:(it.pubDate||"").slice(0,16)}; });
  }catch(e){ return []; }
};
