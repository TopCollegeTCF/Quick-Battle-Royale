CREATE TABLE battles (
	  elixir_start INTEGER DEFAULT 0,
  	elixir_refil_amount INTEGER DEFAULT 1,
	  elixir_refil_cooldown INTEGER,
 	  elixir_card_cost INTEGER,
    cards_amount INTEGER,
  	match_start_time TIME DEFAULT "03:00",
  	match_spend_time INTEGER DEFAULT 1,
  	tower_noking_hp INTEGER DEFAULT 2500,
  	tower_withking_hp INTEGER DEFAULT 5000,
  	amount_of_towers INTEGER	
);
