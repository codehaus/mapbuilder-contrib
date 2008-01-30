		var x = false;
			
function zeige() {
				if(x) {
					x= false;
					new Effect.Fade('arrowDown');
					new Effect.Appear('arrowUp');
					new Effect.Appear('fade_in_text'); 
				} else {
					x = true;
					new Effect.Fade('fade_in_text');
					new Effect.Fade('arrowUp');
					new Effect.Appear('arrowDown');
				}
}