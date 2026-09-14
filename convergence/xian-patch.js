(function(){
  var x=window.XIAN; if(!x||!x.twigs) return;
  x.twigs=x.twigs.map(function(t){
    if(t.n==="PCA / conservative Reformed"){
      return {
        n:"PCA / conservative Reformed",
        w:"The Presbyterian Church in America binds itself to the Westminster Confession, chapters 32–33: the dead are raised with the same bodies; there is a last judgment; the day is unknown so the church stays awake; Scripture acknowledges no third place for souls. The Assembly once refused to declare premillennialism official. Most teaching elders are amillennial; some are historic premillennial; a Scofield chart is rare in a PCA pulpit. Ordinary means: Word, sacrament, prayer. Speculation is a vice. A model may help a pastor study. It is not a means of grace and it is not a prophet.",
        q:{t:"As Christ would have us to be certainly persuaded that there shall be a day of judgment… so will he have that day unknown to men, that they may shake off all carnal security, and be always watchful.", s:"Westminster Confession 33.3 · the PCA’s last-things chapter"},
        flow:[{n:"Already come", d:"The kingdom is inaugurated. We are already in the last days."},{n:"Ordinary means", d:"Word, sacrament, prayer. No new revelation."},{n:"Day unknown", d:"Watch. Do not date."},{n:"He returns", d:"Bodily. Then judgment. Then new creation."}]
      };
    }
    return t;
  });
  if(!x.twigs.some(function(t){return t.n==="Ligonier / Sproul";})){
    x.twigs.splice(10,0,{
      n:"Ligonier / Sproul",
      w:"R.C. Sproul (1939–2017) is not the PCA, but he is the teacher a great many PCA rooms actually heard. He never took the dispensational chart. He read much of the Olivet Discourse as a real coming-in-judgment on Jerusalem in AD 70 — and still confessed a future, final, bodily return. Late in life he said he found himself drawn to an orthodox postmillennial reading with a moderate preterist view of those verses. Ligonier’s own line: the church has been in the last days since the resurrection; the last day itself may still be a long way off.",
      q:{t:"The coming of Christ in AD 70 was a coming in judgment on the Jewish nation, indicating the end of the Jewish age and the fulfillment of a day of the Lord. Jesus really did come in judgment at that time… But this was not the final or ultimate coming of Christ.", s:"R.C. Sproul · The Last Days According to Jesus, p. 158"},
      flow:[{n:"AD 70", d:"A real judgment-coming. Not the last one."},{n:"Last days now", d:"Since the resurrection. Not a new headline."},{n:"Final return", d:"Still future. Bodily. Unknown hour."},{n:"New creation", d:"After the court — not an upgraded tool."}]
    });
  }
})();
