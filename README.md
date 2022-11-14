# Pongish

## Rules

### Pong rules

ball leaves puck based on incident angle
ball leaves puck with additional angle based on whether paddle is moving
ball leaves puck 180 deg if contacting corner of paddle

ball hits your side of the screen, other player gets point

### Air hockey rules

same but paddle is circle, angle of departure is adjusted by angle off-axis from center of parallel ray to incoming vector that passes through the center of circle
same but only small window for scoring

### Breakout rules

only lose if ball leaves via bottom of screen
ball breaks paddle when block contacted loses all HP
blocks have various hp
board arrangements

### Warlords rules

only lose if center block of your fort is destroyed
breakout rules, two player, no edge of screen scoring

## How Do

* html5 canvas
* field size is 100x100, units are %
* use canvas to scale
* min ball movement rate is 33 units per second
* max ball movement rate is 200 units per second (166? tweak)
* max paddle movement rate is inf
* ball is rect
* paddle is rect
* w(paddle) == w(ball) == n/100 of screen, tweak

collision calculation easier
