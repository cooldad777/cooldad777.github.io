(function(){
  if(!window.REST) return;
  window.REST=window.REST.map(function(x){
    if(x.id==="hindu"){
      x.name="Hindu families";
      x.what="Not one church. Called families here because that is how the traditions often describe themselves: a household of sampradayas (Vaishnava, Shaiva, Shakta, Smartism) sharing dharma, karma, and rebirth — not a single last-hour chart. Sanātana dharma is a way of life before it is a creed.";
    }
    return x;
  });
})();
