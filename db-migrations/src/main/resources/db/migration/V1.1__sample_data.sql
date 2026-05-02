--------------------------------------------------------------------------------
-- Filename:  V1.1__sample_data.sql
--------------------------------------------------------------------------------

-- Insert some fake exceptions records
insert into exceptions(id, app_name, app_version, url, event_date, message, cause, stack_trace)
values (1001, 'PlaceRL Web App', '1.0.1', '/api/reports/add', now() - interval '25 days', 'message is here',
        'cause is here', 'Here is hte long stack trace'),
       (1002, 'PlaceRL Web App', '1.0.1', '/api/reports/add', now() - interval '20 days', 'message is here',
        'cause is here', 'Here is hte long stack trace'),
       (1003, 'PlaceRL Web App', '1.0.1', '/api/reports/edit', now() - interval '15 days', 'message is here',
        'cause is here', 'Here is hte long stack trace'),
       (1004, 'PlaceRL Web App', '1.0.1', '/api/reports/edit', now() - interval '14 days', 'message is here',
        'cause is here', 'Here is hte long stack trace'),
       (1005, 'PlaceRL Web App', '1.0.1', '/api/reports/delete', now() - interval '10 days', 'message is here',
        'cause is here', 'Here is hte long stack trace');

-- PostgreSQL INSERT statements for Roblox places data

INSERT INTO places(id, server_size, visits, favorites, likes, dislikes, description, thumbnail_url, creator_userid,
                   title, maturity_id, genre_id)
VALUES (4972091010, 5, 1100000000, 3396493, 982000, 50000, '🔨 HUGE WINTER UPDATE
New weapons, new battle pass, new prestige, smarter zombies, huge improvements, and more!

Team up with friends to survive and fight against waves of zombies! There are over 150 advanced and customizable weapons to choose from, and many unique and challenging locations! Humanity depends on you to survive the ZOMBIE UPRISING!

🎁Battle Pass
Earn cases, income boosts, weapons, a skin, and more!
Use the ''event'' button at the top of the screen for more information.

👍 Give the game a thumbs up and favorite if you like it!

🔨 Update Log: https://devforum.roblox.com/t/u/564488
🎮 Available on computer, mobile, tablet and Xbox One!

🌟 ROBLOX Premium members get +10% cash and points and +1,500 starting points!
⚔️ USSF members get free skins, +10% cash and points and +1,500 starting points!',
        'https://tr.rbxcdn.com/180DAY-4926768eead866a7f48e176ea9a15e4d/768/432/Image/Webp/noFilter', 22025,
        'Zombie Uprising', 0, 0),

       (2768379856, 16, 2700000000, 5213825, 1000000, 166000, 'Thumbnail by: PlagueDoctor_Dash
---
Welcome to 3008, the unusually large furniture store. Wander through the vast horror land of home hardware located within 3008-1. Build a base, survive from employees.',
        'https://tr.rbxcdn.com/180DAY-3a9c765c9d0f0bf88131301ba3e05ddd/768/432/Image/Webp/noFilter', 22718068,
        '3008 [2.73]', 0, 0),

       (94355531429610, 50, 46100, 2237, 681, 46, 'HAPPY BIRTHDAY PAUL',
        'https://tr.rbxcdn.com/180DAY-e45dcc2574eb56136d1d3edce903d3e4/768/432/Image/Webp/noFilter', 2495365530,
        'Cart ride into the pregnant BEATLES', 0, 0),

       (81556242383475, 50, 628700, 11770, 2648, 1005, 'Frank Heffley obby',
        'https://tr.rbxcdn.com/180DAY-e5d509c27a804e8fb8d465286b7603d2/768/432/Image/Webp/noFilter', 35708866,
        'Frank Heffley Obby [Horror]', 0, 0),

       (6655394870, 1, 12000000, 22466, 9812, 1479, 'This is the very best Roblox creation.',
        'https://tr.rbxcdn.com/180DAY-4ba769c15cd9ee37fd169ac550cbcea7/768/432/Image/Webp/noFilter', 4533137, 'DVD MAN',
        0, 0),

       (10130446245, 12, 969700, 15790, 5483, 2285, 'Walt and Dark Skyler have TAKEN OVER Albuquerque! Join Jesse, Saul and Gus to defeat them with the power of the crystals!

(THIS IS A HARD OBBY, BE WARNED)',
        'https://tr.rbxcdn.com/180DAY-f15490e340837cba41848e4abeb7ad01/768/432/Image/Webp/noFilter', 23603593,
        'Breaking Bad Obby', 0, 0),

       (8438158667, 25, 73700000, 255888, 66000, 18000,
        'Tumble down a huge slide while inside a house and try to survive!',
        'https://tr.rbxcdn.com/180DAY-a5dfb8ba2af8701987a15dd15d409b2c/768/432/Image/Webp/noFilter', 13169595,
        'Slide House Tumble', 0, 0),

       (75178130800403, 20, 3000000, 11426, 5011, 322,
        'WARNING, THIS GAME CONTAINS FLASHING LIGHTS, LOUD SOUNDS, AND HEAVY SCREENSHAKE.  -------  McMario Bro.  -------  you are golden sigma, get the idol please thnak you  this game is supposed to be difficult  inspired by wegas challenge by peeblo "Wexecution" by kiwiquest "WEGAFADENCE" by GAMR "BEAR 5 ALERT" by GAMR "Friend''s Store" by GAMR "Skibludi''s Challenge" by raleigh',
        'https://tr.rbxcdn.com/180DAY-18f847117ca9026275f4440b61dad9b1/768/432/Image/Webp/noFilter', 3003135472,
        'RichesGramBag BrothershipbenchingGolden Sigma [skin drop 4] WEGA''S CHALLENGE: THE IDOL', 0, 0),

       (15134934851, 15, 704100, 34901, 11000, 609,
        'traverse through the glorious sights of cart ride for corndog 1995, obtain the components needed to forge a corndog.  i added a sponge and his name is spongelobert say hi to him when you get the chance   special thanks to my friend Chancellor_Izunia, and MiniCheeseItMan for the impeccable voice acting work and also thanks to Karanown for being a bad influence I guess',
        'https://tr.rbxcdn.com/180DAY-ef1c115eda4b2eb4271721329b71e78c/768/432/Image/Webp/noFilter', 115592229,
        'cart ride for corndog', 0, 0);
