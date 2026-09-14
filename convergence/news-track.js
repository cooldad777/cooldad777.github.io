window.NEWS_ASOF = "2026-09-14";
window.TRACK = [
  {id:"aug20", date:"2026-08-20", title:"Catholic refusal current", what:"National Catholic Register: some Catholics read Magnifica humanitas as grounds not to use chatbots at all. Leo has not banned them.", href:"https://www.ncregister.com/news/the-catholic-anti-ai-movement-is-here"},
  {id:"aug27", date:"2026-08-27", title:"Economist: religion tries to change AI", what:"A Catholic-trained chatbot (Magisterium AI) is claiming millions of users in the same season Rome is writing rules for the tool.", href:"https://www.economist.com/international/2026/08/27/ai-is-changing-religion-and-religions-are-trying-to-change-ai"},
  {id:"aug28", date:"2026-08-28", title:"Leo: do not hand life-decisions to machines", what:"The pontiff called for an ethical frame. Technology must serve life, peace, the common good — not the reverse.", href:"https://www.ncregister.com/topic/ai"},
  {id:"sep06", date:"2026-09-06", title:"Bali congress closes", what:"Scholas + Dicastery for Interreligious Dialogue. Line that traveled: AI must liberate, not enslave. Set next to Magnifica humanitas and Tri Hita Karana.", href:"https://www.vaticannews.va/en/church/news/2026-09/scholas-chairs-congress-ai-must-liberate-not-enslave.html"}
];
window.TRACK_READ = {
  christianity:{
    g1:"The Judge is a person who rose. A congress and a chatbot are not the return. They are a fight over who speaks in the church’s voice.",
    g2:{"Catholic":"Rome can point at an encyclical and send a dicastery to Bali. Public revelation is still closed.","Protestant + Independent":"No encyclical binds a session or a Baptist congregation. The same headline still asks whether the voice is servant or rival pulpit.","Orthodox families":"An icon shows a face. A faceless helper is a poor icon."},
    g3:{"Latin Catholic":"Bali is pastoral application. Magisterium AI is at best a library.","PCA":"Ordinary means. Westminster 33.3 keeps the day unknown.","Nondenominational / seeker":"Production can start to feel like presence.","Pentecostal / AoG":"Test the spirit.","Southern Baptist":"Mission verse still Matthew 24:14. A product launch is not that end.","Eastern Orthodox":"Liturgy first. A thread is not communion.","Mainline":"The live word is labor and dignity, not a seven-year chart.","Adventist":"A speaking image is already in the book they preach. Rhyme is still not a date."},
    g4:{"Official magisterium":"An encyclical is not a fourth Testament.","Refusal current":"Prudence, for this room, means refusal.","Magisterium-AI users":"A curated index is still not the bishop.","Ligonier / Sproul classroom":"AD 70 was a real judgment-coming and still not the last one.","North Point-type":"A model that writes the talk is already in the building.","Prophetic-apostolic / NAR":"A powerful tool will look like an anointing to some and a rival altar to others.","Pew dispensational":"Revelation 13 has an image that speaks. Rhyme is not a date."}
  },
  islam:{
    g1:"Tawhid. A voice treated as knower-of-all sits near shirk. The Hour is not scheduled by Bali.",
    g2:{"Sunni":"No pope wrote the encyclical. Hudhayfah’s ten signs did not move.","Shia":"The twelfth Imam is not in Bali."},
    g3:{"Sunni Hour sequence":"Dajjal literature is wonders that ask for worship. A congress is not that figure.","Twelver Shia":"Occultation continues.","Hanbali / Salafi":"Test wonders against tawhid first."},
    g4:{}
  },
  hindu:{
    g1:"Families, not one church. Bali named Tri Hita Karana. A chatbot reciting Gita lines is still not a guru with a lineage.",
    g2:{"Vaishnava":"Gita 4.7 is a person sending himself.","Shaiva":"A placeless helper has no temple."},
    g3:{}, g4:{}
  }
};
window.fetchNewsHeadlines = async function(){
  var q="https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent("https://news.google.com/rss/search?q=Pope+Leo+AI+OR+religion+artificial+intelligence&hl=en-US&gl=US&ceid=US:en");
  try{ var r=await fetch(q); var j=await r.json(); return (j.items||[]).slice(0,4).map(function(it){ return {title:it.title, href:it.link}; }); }
  catch(e){ return []; }
};
