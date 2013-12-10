i290P4
======
Project title: Stalkerbook: The Who Am I? Facebook Guessing Game

Project description: The user is asked to log into Facebook so that the app can access the user's friend list. The app picks one of the user's connections and the user has to guess who that person is based on 3-5 clues. A number of other random friends are added, so that the user doesn't have to choose blindly. After each wrong guess, the user is given another clue, but this lowers the potential number of points available. Scoring, time bonuses, and a combo multiplier are added for EXTREME FUN. Leaderboards keep track of all-time scores, player scores, and individual "target" scores. Facebook targets are randomly chosen from the user's connections, so long as they have at least one educational institution and one company listed. All other friends in the list are randomly chosen with image and name, to be potential wrong guesses.

Team members and roles:
 - Dan Tsai: PHP and MySQL backend, CSS, HTML, JavaScript. Leaderboards.
 - Jenton Lee: PHP, HTML, JavaScript. Facebook and data scraping.
 - Eunkwang Joo: CSS, HTML, JavaScript. Scoring.
 - Sandra Helsley: CSS, HTML, JavaScript. Friend grid, prettiness, code police, nonsensical commit message writer.
 - Everybody: a little bit of everything! AND SO MANY BUG FIXES

Technologies used: HTML, CSSS, JavaScript (and jQuery), PHP, MySQL, Facebook API

Link to demo version: http://people.ischool.berkeley.edu/~jenton/i290P4/

Known bugs: 
 - Clicking on the side of the image also triggers a guess; we decided to leave it since that allows clicking on the name also 
 - Sometimes if somebody has a really long clue (e.g., TONS of interests) it can sometimes hide underneath the friend grid or make the wrong guess alert looks ugly. This is primarily cosmetic and most people have fairly short clues, so we left it.
 - While we tried our best to make it mobile-friendly, it really doesn't look good if your screen is less than 900px wide, primarily because of the friend grid. Twenty-one options are probably too many to make a good game on a phone, anyhow.
 - No Kohl's API integration.