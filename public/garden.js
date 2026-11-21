'use strict';
(() => {
const $ = s => document.querySelector(s);
const canvas=$('#garden'),ctx=canvas.getContext('2d'),W=1200,H=1080,MAX_SIZE=3600;
const sprites=new Map(), thumbs=new Map(), hitShapes=new Map(), sources={creatures30:['assets/creatures-consistent-v30.webp',3,3],creatures29:['assets/creatures-consistent-v29.webp',3,3],animals28:['assets/animals-consistent-v28.webp',3,3],animals27:['assets/animals-consistent-v27.webp',3,2],cats26:['assets/cats-consistent-v27.webp',3,1],garden25:['assets/garden-additions-v25.webp',3,3],pelvis24:['assets/pelvis-lumbar-v24.webp',1,1],cats23:['assets/cats-skeletons-v23.webp',3,3],mushrooms:['assets/mushrooms.webp',3,2],visitors:['assets/visitors.webp',3,2],critters:['assets/critters.webp',3,3],sky:['assets/sky.webp',3,2],woodland:['assets/woodland.webp',3,3],cosmic:['assets/cosmic.webp',2,2],grounds:['assets/grounds.webp',3,3],ruins:['assets/ruins.webp',3,3],rituals:['assets/rituals.webp',3,3],idol:['assets/idol.webp',1,1],skyextra:['assets/sky-extra.webp',3,2],newnature:['assets/nature-new.webp',3,3],newskyplants:['assets/sky-plants-new.webp',3,2],mythic:['assets/mythic-v4.webp',3,3],bonesprops:['assets/bones-props-v4.webp',3,3],oddities:['assets/oddities-v4.webp',3,3],companions:['assets/companions-v4.webp',3,3],animals5a:['assets/animals-a-v5.webp',3,3],animals5myth:['assets/animals-myth-v5.webp',3,3],animals5cats:['assets/animals-cats-v5.webp',3,3],props5fire:['assets/props-fire-v5.webp',3,2],props5bones:['assets/props-bones-v5.webp',2,2],penguin13:['assets/penguin-v13.webp',1,1],animals16:['assets/animals-v16.webp',3,2],magic16:['assets/magic-v16.webp',3,3],objects16:['assets/objects-v16.webp',3,2],creatures18a:['assets/creatures-a-v18.webp',3,3],wonders18b:['assets/wonders-b-v18.webp',3,3],creatures18c:['assets/creatures-c-v18.webp',3,3],spellbook:['assets/spellbook.png',1,1],fireflies:['assets/fireflies.png',1,1]};
const oddityCatalog=[
{id:'spellbook',name:'Spellbook',oddityCategory:'magic',sheet:'spellbook',cell:0,size:330},
{id:'fireflies',name:'Fireflies',oddityCategory:'nature',sheet:'fireflies',cell:0,size:300},
{id:'calico-cat',name:'Cat (Sitting)',oddityCategory:'creatures',sheet:'cats26',cell:1,size:210},
{id:'willow-tree',name:'Willow Tree',oddityCategory:'plants',sheet:'garden25',cell:0,size:350},
{id:'birch-tree',name:'Birch Tree',oddityCategory:'plants',sheet:'garden25',cell:1,size:345},
{id:'bare-tree',name:'Bare Tree',oddityCategory:'plants',sheet:'garden25',cell:2,size:345},
{id:'bush',name:'Bush',oddityCategory:'plants',sheet:'garden25',cell:3,size:210},
{id:'horse',name:'Horse',oddityCategory:'creatures',sheet:'garden25',cell:4,size:300},
{id:'smoking-pipe',name:'Smoking Pipe',oddityCategory:'magic',sheet:'garden25',cell:5,size:180},
{id:'white-longhaired-cat',name:'Cat (Rolling)',oddityCategory:'creatures',sheet:'garden25',cell:6,size:230},
{id:'rabbit-skeleton',name:'Skeleton (Rabbit)',oddityCategory:'bones',sheet:'cats23',cell:2,size:250},
{id:'cat-skeleton',name:'Skeleton (Cat)',oddityCategory:'bones',sheet:'cats23',cell:3,size:260},
{id:'bat-skeleton',name:'Skeleton (Bat)',oddityCategory:'bones',sheet:'cats23',cell:4,size:245},
{id:'snake-skeleton',name:'Skeleton (Snake)',oddityCategory:'bones',sheet:'cats23',cell:5,size:250},
{id:'fish-skeleton',name:'Skeleton (Fish)',oddityCategory:'bones',sheet:'cats23',cell:6,size:230},
{id:'cat-skull',name:'Skull (Cat)',oddityCategory:'bones',sheet:'creatures18a',cell:0,size:175},
{id:'jackalope-skull',name:'Skull (Jackalope)',oddityCategory:'bones',sheet:'creatures18a',cell:1,size:235},
{id:'snake',name:'Snake',oddityCategory:'creatures',sheet:'creatures18a',cell:2,size:230},
{id:'lizard',name:'Lizard',oddityCategory:'creatures',sheet:'creatures18a',cell:3,size:210},
{id:'alien-antennae',name:'Alien (Standing)',oddityCategory:'creatures',sheet:'creatures18a',cell:4,size:220},
{id:'alien-cyclops',name:'Cyclops',oddityCategory:'creatures',sheet:'creatures18a',cell:5,size:180},
{id:'beanstalk',name:'Beanstalk',oddityCategory:'plants',sheet:'creatures18a',cell:6,size:330},
{id:'tadpole',name:'Tadpole',oddityCategory:'creatures',sheet:'creatures18a',cell:7,size:140},
{id:'turtle',name:'Turtle',oddityCategory:'creatures',sheet:'creatures18a',cell:8,size:190},
{id:'butterfly',name:'Butterfly',oddityCategory:'creatures',sheet:'wonders18b',cell:0,size:165},
{id:'bird-nest',name:'Bird Nest',oddityCategory:'nature',sheet:'wonders18b',cell:1,size:175},
{id:'snowman',name:'Snowman',oddityCategory:'structures',sheet:'wonders18b',cell:2,size:240},
{id:'fairy',name:'Fairy',oddityCategory:'creatures',sheet:'wonders18b',cell:3,size:220},
{id:'submarine',name:'Submarine',oddityCategory:'structures',sheet:'wonders18b',cell:4,size:300},
{id:'crystal-ball',name:'Crystal Ball',oddityCategory:'magic',sheet:'wonders18b',cell:5,size:185},
{id:'cactus',name:'Cactus',oddityCategory:'plants',sheet:'wonders18b',cell:6,size:245},
{id:'raindrop',name:'Raindrop',oddityCategory:'sky',sheet:'wonders18b',cell:7,size:140},
{id:'snowflake',name:'Snowflake',oddityCategory:'sky',sheet:'wonders18b',cell:8,size:155},
{id:'chipmunk',name:'Chipmunk',oddityCategory:'creatures',sheet:'creatures18c',cell:0,size:165},
{id:'dove',name:'Dove',oddityCategory:'creatures',sheet:'creatures18c',cell:1,size:190},
{id:'jellyfish',name:'Jellyfish',oddityCategory:'creatures',sheet:'creatures18c',cell:2,size:220},
{id:'shell',name:'Shell',oddityCategory:'nature',sheet:'creatures18c',cell:3,size:165},
{id:'worm',name:'Worm',oddityCategory:'creatures',sheet:'creatures18c',cell:4,size:140},
{id:'caterpillar',name:'Caterpillar',oddityCategory:'creatures',sheet:'creatures18c',cell:5,size:160},
{id:'ladybug',name:'Ladybug',oddityCategory:'creatures',sheet:'creatures18c',cell:6,size:110},
{id:'dragonfly',name:'Dragonfly',oddityCategory:'creatures',sheet:'creatures18c',cell:7,size:175},
{id:'crystal-point',name:'Crystal (Point)',oddityCategory:'nature',sheet:'magic16',cell:0,size:185},
{id:'crystal-heart',name:'Crystal (Heart)',oddityCategory:'nature',sheet:'magic16',cell:1,size:165},
{id:'crystal-sphere',name:'Crystal (Sphere)',oddityCategory:'nature',sheet:'magic16',cell:2,size:165},
{id:'kelpie',name:'Kelpie',oddityCategory:'creatures',sheet:'magic16',cell:3,size:320},
{id:'will-o-the-wisp',name:'Wisp',oddityCategory:'creatures',sheet:'magic16',cell:4,size:185},
{id:'gargoyle',name:'Gargoyle',oddityCategory:'creatures',sheet:'magic16',cell:5,size:245},
{id:'forest-spirit',name:'Tiny Forest Spirit',oddityCategory:'creatures',sheet:'magic16',cell:6,size:165},
{id:'antique-key',name:'Antique Key',oddityCategory:'magic',sheet:'magic16',cell:7,size:160},
{id:'potion-bottle',name:'Potion Bottle (Single)',oddityCategory:'magic',sheet:'magic16',cell:8,size:175},
{id:'hourglass',name:'Hourglass',oddityCategory:'magic',sheet:'objects16',cell:0,size:200},
{id:'broken-column',name:'Broken Column',oddityCategory:'structures',sheet:'objects16',cell:1,size:270},
{id:'driftwood',name:'Driftwood',oddityCategory:'nature',sheet:'objects16',cell:2,size:265},
{id:'lily-pad',name:'Lily Pad',oddityCategory:'plants',sheet:'objects16',cell:3,size:220},
{id:'feather',name:'Single Feather',oddityCategory:'nature',sheet:'objects16',cell:4,size:170},
{id:'seal',name:'Seal',oddityCategory:'creatures',sheet:'animals16',cell:0,size:235},
{id:'red-panda',name:'Panda (Red)',oddityCategory:'creatures',sheet:'animals16',cell:1,size:225},
{id:'giant-panda',name:'Panda (Giant)',oddityCategory:'creatures',sheet:'animals16',cell:2,size:250},
{id:'grizzly-bear',name:'Bear (Grizzly)',oddityCategory:'creatures',sheet:'animals16',cell:3,size:300},
{id:'polar-bear',name:'Bear (Polar)',oddityCategory:'creatures',sheet:'animals16',cell:4,size:300},
{id:'single-candle',name:'Candle (Single)',oddityCategory:'magic',sheet:'props5fire',cell:4,size:170},
{id:'rabbit-skull',name:'Skull (Rabbit)',oddityCategory:'bones',sheet:'props5fire',cell:3,size:165},
{id:'bubble',name:'Bubble',oddityCategory:'nature',sheet:'props5fire',cell:2,size:145},
{id:'flame',name:'Flame',oddityCategory:'magic',sheet:'props5fire',cell:1,size:180},
{id:'bonfire',name:'Bonfire',oddityCategory:'magic',sheet:'props5fire',cell:0,size:290},
{id:'scarecrow',name:'Scarecrow',oddityCategory:'structures',sheet:'animals5cats',cell:8,size:320},
{id:'starfish',name:'Starfish',oddityCategory:'creatures',sheet:'creatures30',cell:5,size:150},
{id:'tuxedo-cat',name:'Cat (Dancing)',oddityCategory:'creatures',sheet:'cats26',cell:2,size:210},
{id:'dragon',name:'Dragon',oddityCategory:'creatures',sheet:'creatures29',cell:2,size:320},
{id:'phoenix',name:'Phoenix',oddityCategory:'creatures',sheet:'animals5myth',cell:1,size:290},
{id:'slender-man',name:'Slender Man',oddityCategory:'creatures',sheet:'mythic',cell:2,size:350},
{id:'chupacabra',name:'Chupacabra',oddityCategory:'creatures',sheet:'mythic',cell:3,size:220},
{id:'bigfoot',name:'Bigfoot',oddityCategory:'creatures',sheet:'creatures29',cell:1,size:300},
{id:'jackalope',name:'Jackalope',oddityCategory:'creatures',sheet:'creatures29',cell:5,size:220},
{id:'unicorn',name:'Unicorn',oddityCategory:'creatures',sheet:'creatures30',cell:6,size:280},
{id:'griffin',name:'Griffin',oddityCategory:'creatures',sheet:'creatures29',cell:4,size:300},
{id:'kraken',name:'Kraken',oddityCategory:'creatures',sheet:'creatures29',cell:6,size:330},
{id:'voodoo-doll',name:'Voodoo doll',oddityCategory:'magic',sheet:'bonesprops',cell:0,size:200},
{id:'vines',name:'Vines',oddityCategory:'plants',sheet:'bonesprops',cell:1,size:300},
{id:'deer-skull',name:'Skull (Deer)',oddityCategory:'bones',sheet:'bonesprops',cell:2,size:230},
{id:'wolf-skull',name:'Skull (Wolf)',oddityCategory:'bones',sheet:'bonesprops',cell:3,size:190},
{id:'bird-skull',name:'Skull (Bird)',oddityCategory:'bones',sheet:'bonesprops',cell:4,size:170},
{id:'teeth',name:'Fang',oddityCategory:'bones',sheet:'props5bones',cell:0,size:130},
{id:'skeletal-arm',name:'Skeleton (Arm)',oddityCategory:'bones',sheet:'props5bones',cell:2,size:260},
{id:'skeletal-leg',name:'Skeleton (Leg)',oddityCategory:'bones',sheet:'props5bones',cell:3,size:280},
{id:'skeletal-hips',name:'Skeleton (Pelvis)',oddityCategory:'bones',sheet:'pelvis24',cell:0,size:210,renderScale:1095/940},
{id:'skeletal-hand',name:'Skeleton (Hand)',oddityCategory:'bones',sheet:'oddities',cell:0,size:155},
{id:'skeletal-foot',name:'Skeleton (Foot)',oddityCategory:'bones',sheet:'oddities',cell:1,size:165},
{id:'orb-web',name:'Spiderweb (Fine Weave)',oddityCategory:'nature',sheet:'oddities',cell:2,size:240},
{id:'corner-web',name:'Spiderweb (Tangled)',oddityCategory:'nature',sheet:'props5fire',cell:5,size:250},
{id:'eyeball',name:'Eyeball',oddityCategory:'magic',sheet:'oddities',cell:4,size:130},
{id:'leaf',name:'Leaf (Single)',oddityCategory:'plants',sheet:'oddities',cell:5,size:110},
{id:'leaf-pile',name:'Leaf (Pile)',oddityCategory:'plants',sheet:'oddities',cell:6,size:220},
{id:'knife',name:'Knife',oddityCategory:'magic',sheet:'oddities',cell:7,size:200},
{id:'noose',name:'Noose',oddityCategory:'magic',sheet:'oddities',cell:8,size:250},
{id:'clown',name:'Clown',oddityCategory:'creatures',sheet:'companions',cell:0,size:260},
{id:'black-cat',name:'Cat (Sitting)',hidden:true,oddityCategory:'creatures',sheet:'animals5cats',cell:3,size:210},
{id:'sleeping-cat',name:'Cat (Sleeping)',oddityCategory:'creatures',sheet:'animals28',cell:7,size:200},
{id:'stretching-cat',name:'Cat (Stretching)',oddityCategory:'creatures',sheet:'animals28',cell:8,size:230},
{id:'mirror',name:'Mirror',oddityCategory:'structures',sheet:'companions',cell:4,size:300},
{id:'grass',name:'Grass',oddityCategory:'plants',sheet:'companions',cell:5,size:210},
{id:'weeds',name:'Weeds',oddityCategory:'plants',sheet:'companions',cell:6,size:220},
{id:'clovers',name:'Clovers',oddityCategory:'plants',sheet:'companions',cell:7,size:150},
{id:'penguin',name:'Penguin',oddityCategory:'creatures',sheet:'penguin13',cell:0,size:200},
{id:'dolphin',name:'Dolphin',oddityCategory:'creatures',sheet:'animals27',cell:0,size:290},
{id:'octopus',name:'Octopus',oddityCategory:'creatures',sheet:'animals27',cell:1,size:235},
{id:'falcon',name:'Falcon',oddityCategory:'creatures',sheet:'animals28',cell:4,size:210},
{id:'wolf',name:'Wolf',oddityCategory:'creatures',sheet:'animals27',cell:4,size:240},
{id:'waterbear',name:'Water bear',oddityCategory:'creatures',sheet:'animals27',cell:3,size:160},
{id:'squid',name:'Squid',oddityCategory:'creatures',sheet:'animals27',cell:2,size:250},
{id:'trex',name:'Tyrannosaurus',oddityCategory:'creatures',sheet:'animals28',cell:0,size:300},
{id:'triceratops',name:'Triceratops',oddityCategory:'creatures',sheet:'animals28',cell:1,size:285},
{id:'nessie',name:'Nessie',oddityCategory:'creatures',sheet:'creatures29',cell:8,size:310},
{id:'deer',name:'Deer',oddityCategory:'creatures',sheet:'animals28',cell:2,size:280},
{id:'whale',name:'Whale',oddityCategory:'creatures',sheet:'animals28',cell:3,size:345},
{id:'manatee',name:'Manatee',oddityCategory:'creatures',sheet:'animals27',cell:5,size:265},
{id:'coral',name:'Coral',oddityCategory:'plants',sheet:'newnature',cell:4,size:230},
{id:'pine',name:'Pine Tree',oddityCategory:'plants',sheet:'newnature',cell:5,size:345},
{id:'moss',name:'Moss',oddityCategory:'plants',sheet:'newnature',cell:6,size:180},
{id:'lily',name:'Lily',oddityCategory:'plants',sheet:'newnature',cell:7,size:220},
{id:'morning-glory',name:'Morning glory',oddityCategory:'plants',sheet:'newnature',cell:8,size:240},
{id:'dandelion',name:'Dandelion',oddityCategory:'plants',sheet:'newskyplants',cell:0,size:220},
{id:'poppy-seeds',name:'Poppy Seed Pods',oddityCategory:'plants',sheet:'newskyplants',cell:1,size:190},
{id:'cannabis',name:'Cannabis',oddityCategory:'plants',sheet:'newskyplants',cell:2,size:275},
{id:'solar-eclipse',name:'Eclipse (Solar)',oddityCategory:'sky',sheet:'newskyplants',cell:3,size:220},
{id:'lunar-eclipse',name:'Eclipse (Lunar)',oddityCategory:'sky',sheet:'companions',cell:8,size:220},
{id:'satellite',name:'Satellite',oddityCategory:'sky',sheet:'newskyplants',cell:5,size:250},
{id:'moon-full',name:'Moon (Full)',oddityCategory:'sky',sheet:'sky',cell:0,size:180},
{id:'moon-crescent',name:'Moon (Crescent)',oddityCategory:'sky',sheet:'sky',cell:1,size:170},
{id:'moon-half',name:'Moon (Half)',oddityCategory:'sky',sheet:'sky',cell:2,size:170},
{id:'moon-blood',name:'Moon (Blood)',oddityCategory:'sky',sheet:'sky',cell:3,size:180},
{id:'lightning',name:'Lightning',oddityCategory:'sky',sheet:'sky',cell:5,size:260},
{id:'galaxy-violet',name:'Galaxy (Violet)',oddityCategory:'sky',sheet:'cosmic',cell:0,size:380},
{id:'galaxy-teal',name:'Galaxy (Teal)',oddityCategory:'sky',sheet:'cosmic',cell:1,size:380},
{id:'galaxy-rose',name:'Galaxy (Rose)',oddityCategory:'sky',sheet:'cosmic',cell:2,size:380},
{id:'shooting-star',name:'Shooting star',oddityCategory:'sky',sheet:'cosmic',cell:3,size:220},
{id:'comet',name:'Comet',oddityCategory:'sky',sheet:'skyextra',cell:0,size:250},
{id:'sun',name:'Sun',oddityCategory:'sky',sheet:'skyextra',cell:1,size:210},
{id:'rainbow',name:'Rainbow',oddityCategory:'sky',sheet:'skyextra',cell:2,size:350},
{id:'planet',name:'Planet',oddityCategory:'sky',sheet:'skyextra',cell:3,size:250},
{id:'clouds',name:'Clouds',oddityCategory:'sky',sheet:'skyextra',cell:4,size:300},
{id:'tornado',name:'Tornado',oddityCategory:'sky',sheet:'skyextra',cell:5,size:340},
{id:'rock',name:'Mossy rock',oddityCategory:'nature',sheet:'grounds',cell:0,size:190},
{id:'log',name:'Hollow log',oddityCategory:'nature',sheet:'grounds',cell:1,size:270},
{id:'stump',name:'Tree stump',oddityCategory:'nature',sheet:'grounds',cell:2,size:240},
{id:'roots',name:'Twisting roots',oddityCategory:'nature',sheet:'grounds',cell:3,size:300},
{id:'pond',name:'Pond',oddityCategory:'nature',sheet:'grounds',cell:4,size:330},
{id:'stones',name:'Stepping stones',oddityCategory:'nature',sheet:'grounds',cell:5,size:260},
{id:'bridge',name:'Bridge',oddityCategory:'structures',sheet:'grounds',cell:6,size:340},
{id:'fairyring',name:'Fairy Ring',oddityCategory:'mushrooms',sheet:'grounds',cell:7,size:300},
{id:'antlers',name:'Antlers',oddityCategory:'bones',sheet:'grounds',cell:8,size:200},
{id:'statue',name:'Cracked statue',oddityCategory:'structures',sheet:'ruins',cell:0,size:300},
{id:'ribs',name:'Skeleton (Ribs)',oddityCategory:'bones',sheet:'ruins',cell:1,size:190},
{id:'bones',name:'Scattered bones',oddityCategory:'bones',sheet:'ruins',cell:2,size:175},
{id:'gravestone',name:'Gravestone',oddityCategory:'structures',sheet:'ruins',cell:3,size:225},
{id:'mausoleum',name:'Mausoleum',oddityCategory:'structures',sheet:'ruins',cell:4,size:330},
{id:'arch',name:'Ruined arch',oddityCategory:'structures',sheet:'ruins',cell:5,size:340},
{id:'gate',name:'Iron gate',oddityCategory:'structures',sheet:'ruins',cell:6,size:330},
{id:'fence',name:'Iron fence',oddityCategory:'structures',sheet:'ruins',cell:7,size:275},
{id:'crystals',name:'Crystal (Cluster)',oddityCategory:'nature',sheet:'ruins',cell:8,size:180},
{id:'candles',name:'Candle (Cluster)',oddityCategory:'magic',sheet:'rituals',cell:0,size:190},
{id:'lantern',name:'Lantern',oddityCategory:'magic',sheet:'rituals',cell:1,size:200},
{id:'cauldron',name:'Cauldron',oddityCategory:'magic',sheet:'rituals',cell:2,size:225},
{id:'potions',name:'Potion Bottle (Set)',oddityCategory:'magic',sheet:'rituals',cell:3,size:180},
{id:'gnome',name:'Gnome',oddityCategory:'creatures',sheet:'rituals',cell:4,size:220},
{id:'alien',name:'Alien (Seated)',oddityCategory:'creatures',sheet:'rituals',cell:5,size:210},
{id:'ufo',name:'UFO',oddityCategory:'sky',sheet:'rituals',cell:6,size:220},
{id:'pentagram',name:'Pentagram',oddityCategory:'magic',sheet:'rituals',cell:7,size:220},
{id:'ritualcircle',name:'Ritual circle',oddityCategory:'magic',sheet:'rituals',cell:8,size:300},
{id:'idol',name:'Horned idol',oddityCategory:'magic',sheet:'idol',cell:0,size:220},
{id:'toadstool',name:'Mushroom (Spots)',oddityCategory:'mushrooms',sheet:'mushrooms',cell:0,size:245},
{id:'wavy',name:'Mushroom (Wavy)',oddityCategory:'mushrooms',sheet:'mushrooms',cell:1,size:265},
{id:'ruffles',name:'Mushroom (Ruffled)',oddityCategory:'mushrooms',sheet:'mushrooms',cell:2,size:220},
{id:'twins',name:'Mushroom (Pair)',oddityCategory:'mushrooms',sheet:'mushrooms',cell:3,size:185},
{id:'curly',name:'Mushroom (Curled Cap)',oddityCategory:'mushrooms',sheet:'mushrooms',cell:4,size:225},
{id:'bell',name:'Mushroom (Ghost)',oddityCategory:'mushrooms',sheet:'mushrooms',cell:5,size:235},
{id:'fern',name:'Fern',oddityCategory:'plants',sheet:'woodland',cell:0,size:250},
{id:'rose',name:'Thorny rose',oddityCategory:'plants',sheet:'woodland',cell:1,size:260},
{id:'nightshade',name:'Nightshade',oddityCategory:'plants',sheet:'woodland',cell:2,size:245},
{id:'sapling',name:'Crooked Tree',oddityCategory:'plants',sheet:'woodland',cell:3,size:345},
{id:'flytrap',name:'Flytrap',oddityCategory:'plants',sheet:'woodland',cell:4,size:215},
{id:'fox',name:'Fox',oddityCategory:'creatures',sheet:'woodland',cell:5,size:220},
{id:'owl',name:'Owl',oddityCategory:'creatures',sheet:'woodland',cell:6,size:205},
{id:'hedgehog',name:'Hedgehog',oddityCategory:'creatures',sheet:'woodland',cell:7,size:150},
{id:'mouse',name:'Mouse',oddityCategory:'creatures',sheet:'woodland',cell:8,size:130},
{id:'cat',name:'Cat (Walking)',oddityCategory:'creatures',sheet:'cats26',cell:0,size:190},
{id:'frog',name:'Frog',oddityCategory:'creatures',sheet:'creatures29',cell:3,size:145},
{id:'snail',name:'Snail',oddityCategory:'creatures',sheet:'creatures30',cell:3,size:130},
{id:'bunny',name:'Bunny',oddityCategory:'creatures',sheet:'animals28',cell:5,size:190},
{id:'raccoon',name:'Raccoon',oddityCategory:'creatures',sheet:'animals28',cell:6,size:200},
{id:'bat',name:'Bat',oddityCategory:'creatures',sheet:'creatures29',cell:0,size:165},
{id:'possum',name:'Possum',oddityCategory:'creatures',sheet:'creatures30',cell:0,size:180},
{id:'shrimp',name:'Shrimp',oddityCategory:'creatures',sheet:'creatures30',cell:2,size:140},
{id:'raven',name:'Raven',oddityCategory:'creatures',sheet:'creatures30',cell:1,size:190},
{id:'spider',name:'Spider',oddityCategory:'creatures',sheet:'creatures30',cell:4,size:115},
{id:'ghost',name:'Ghost',oddityCategory:'creatures',sheet:'visitors',cell:3,size:180},
{id:'skull',name:'Skull (Human)',oddityCategory:'bones',sheet:'props5bones',cell:1,size:130},
{id:'pumpkin',name:'Pumpkin (Whole)',oddityCategory:'plants',sheet:'visitors',cell:5,size:160},
{id:'mothman',name:'Mothman',oddityCategory:'creatures',sheet:'creatures29',cell:7,size:240},
{id:'jack',name:'Pumpkin (Carved)',oddityCategory:'plants',sheet:'critters',cell:8,size:160},
{id:'web',name:'Spiderweb (Wide Weave)',oddityCategory:'nature',sheet:'sky',cell:4,size:200}];
const customRects={cats26:[[10,100,720,735],[730,90,536,735],[1266,100,508,725]],garden25:[[25,15,430,479],[465,25,373,463],[875,15,365,480],[15,540,425,328],[455,489,365,400],[860,592,380,266],[20,879,487,364]],cats23:[[40,10,368,473],[429,5,438,478],[897,10,345,470],[15,490,385,405],[405,524,492,339],[897,499,347,385],[12,915,453,319]],creatures18a:[[50,85,345,300],[450,0,360,418],[855,35,383,380],[10,482,430,330],[461,415,364,428],[901,470,323,337],[65,815,318,439],[465,868,340,320],[842,900,400,305]],wonders18b:[[15,45,438,354],[455,70,385,332],[888,35,335,398],[35,408,405,442],[450,438,425,357],[915,450,295,360],[50,807,357,432],[510,833,245,386],[852,810,386,423]],creatures18c:[[15,25,415,387],[438,20,369,390],[890,5,356,450],[20,455,397,338],[444,468,385,287],[848,468,394,293],[10,835,390,390],[418,850,438,370],[855,765,389,475]],magic16:[[150,0,175,400],[455,45,360,335],[875,45,330,332],[10,380,485,440],[515,383,265,437],[843,400,400,417],[87,823,305,418],[435,815,410,418],[895,810,310,425]],objects16:[[125,15,285,490],[580,30,345,480],[995,80,530,410],[10,560,510,410],[525,520,490,490]],animals16:[[0,45,558,447],[565,0,484,506],[1050,0,486,506],[10,495,548,495],[558,515,522,479]],newnature:[[17,69,424,381],[488,28,298,440],[839,124,413,311],[14,533,410,288],[465,496,352,351],[883,460,343,396],[31,895,382,322],[472,875,359,344],[879,874,354,364]],ruins:[[76,26,288,427],[469,87,320,354],[861,110,368,317],[45,484,345,349],[446,441,363,400],[860,451,365,384],[32,834,366,390],[449,894,359,292],[881,869,327,342]],rituals:[[10,4,403,422],[476,0,311,419],[852,6,377,417],[18,431,379,402],[440,421,358,410],[860,434,376,396],[6,872,405,366],[433,835,377,416],[820,890,434,330]],idol:[[247,148,760,977]],grounds:[[30,54,391,346],[433,91,404,295],[857,48,377,364],[24,446,415,405],[441,462,403,343],[857,440,373,382],[32,892,407,337],[444,878,394,338],[860,861,374,366]],woodland:[[18,4,404,427],[436,27,395,400],[857,32,383,407],[24,432,411,393],[441,444,401,382],[875,440,367,390],[44,826,354,422],[440,877,404,336],[916,869,312,350]],critters:[[10,8,407,406],[428,35,398,373],[826,64,428,310],[7,461,420,326],[438,420,389,381],[871,410,378,404],[7,844,406,385],[410,799,438,444],[850,817,400,415]],sky:[[48,38,426,422],[591,31,395,438],[1174,23,266,450],[39,523,447,440],[521,486,491,499],[1050,486,452,537]]};
const sheetExclusions={wonders18b:{3:[[135,402,270,40]],6:[[0,0,115,33]]},magic16:{3:[[0,0,320,20]]}};
const titleCaseLabel=text=>text.replace(/\b[a-z]/g,letter=>letter.toUpperCase()).replace(/\b(A|An|And|As|At|But|By|For|In|Nor|Of|On|Or|The|To|Via)\b/g,(word,offset)=>offset?word.toLowerCase():word).replace('Will-O’','Will-o’');
const characterIds=new Set(['alien','alien-antennae','alien-cyclops','fairy','kelpie','will-o-the-wisp','gargoyle','forest-spirit','dragon','phoenix','slender-man','chupacabra','bigfoot','jackalope','unicorn','griffin','kraken','clown','gnome','ghost','mothman','nessie']);const propIds=new Set(['antique-key','hourglass','single-candle','candles','lantern','knife','noose','eyeball','submarine','scarecrow','mirror','snowman','smoking-pipe']);for(const item of oddityCatalog){item.name=titleCaseLabel(item.name);if(item.oddityCategory==='creatures')item.oddityCategory=characterIds.has(item.id)?'characters':'animals';if(propIds.has(item.id))item.oddityCategory='props';if(['flame','bonfire'].includes(item.id))item.oddityCategory='nature';if(['snowman','scarecrow'].includes(item.id))item.oddityCategory='characters';}
oddityCatalog.sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));
const byId=Object.fromEntries(oddityCatalog.map(v=>[v.id,v]));
const colorOptions={haunted:{name:'Natural',bg:'#f2f0f7',wash:'#dedbe9',ink:'#30263e',accent:'#78596d',hue:0},candy:{name:'Candy',bg:'#fff6ec',wash:'#fae5e8',ink:'#38304c',accent:'#e76f86',hue:325,filter:'saturate(1.3) brightness(1.05)',tint:'#ed6284',tintAlpha:.2},bog:{name:'Bog',bg:'#f6fae9',wash:'#e3ecd0',ink:'#33463a',accent:'#6c9368',hue:62,filter:'sepia(.2) saturate(.9)',tint:'#7ea24b',tintAlpha:.3},dusk:{name:'Dusk',bg:'#f3f1fc',wash:'#e4def4',ink:'#423251',accent:'#a57abd',hue:300,filter:'saturate(1.15) brightness(.87)',tint:'#8350aa',tintAlpha:.3},monochrome:{name:'B & W',bg:'#f3f3f3',wash:'#dedede',ink:'#303030',accent:'#777777',hue:0,filter:'grayscale(1)'},ember:{name:'Ember',bg:'#fff2de',wash:'#efcfab',ink:'#4b241e',accent:'#bd522c',hue:25,filter:'sepia(.55) saturate(1.4)',tint:'#da632a',tintAlpha:.3},ocean:{name:'Ocean',bg:'#eef7fa',wash:'#cbdfe9',ink:'#213948',accent:'#477f94',hue:170,filter:'sepia(.15) saturate(1.1)',tint:'#337fba',tintAlpha:.32},spectral:{name:'Spectral',bg:'#f2faee',wash:'#dbefda',ink:'#304b41',accent:'#719c83',hue:90,filter:'sepia(.3) saturate(.55) brightness(1.1)',tint:'#b6dfc3',tintAlpha:.35}};
const weatherChoices=[{value:'clear',label:'Clear'},{value:'mist-wisps',label:'Mist'},{value:'mist',label:'Haze'},{value:'fog',label:'Fog'},{value:'smoke',label:'Smoke'},{value:'smog',label:'Smog'},{value:'drizzle',label:'Drizzle'},{value:'rain',label:'Rain'},{value:'heavy-rain',label:'Downpour'},{value:'thunderstorm',label:'Storm'},{value:'flurries',label:'Flurries'},{value:'snow',label:'Snow'},{value:'blizzard',label:'Blizzard'},{value:'breeze',label:'Breeze'},{value:'wind',label:'Wind'},{value:'gusts',label:'Gusts'}];
const weatherLabel=value=>weatherChoices.find(option=>option.value===value)?.label||titleCaseLabel(value);
const biomeNames=['none','swamp','greenhouse','tide-pools','ruins','attic','crystal-cavern','frozen-lake','rooftop','haze','gnome-hollow','ember-river','abandoned-prison','under-bridge','cave','backyard-garden','basement','beach','corn-maze','desert','factory','forest','graveyard','haunted-house','heaven','hell','jungle','pumpkin-patch','river','sandy-dunes','space','steampunk','underwater','void','volcano','wonderland'];
const biomeLabels={'none':'Blank','swamp':'Swamp','greenhouse':'Greenhouse','tide-pools':'Tide Pools','ruins':'Ruins','attic':'Attic','crystal-cavern':'Crystal Cavern','frozen-lake':'Frozen Lake','rooftop':'Rooftop','haze':'Haze','abandoned-prison':'Prison','under-bridge':'Bridge','cave':'Cave','backyard-garden':'Backyard','basement':'Basement','beach':'Beach','corn-maze':'Corn maze','desert':'Desert','factory':'Factory','forest':'Forest','graveyard':'Graveyard','haunted-house':'Haunted house','heaven':'Heaven','hell':'Hell','jungle':'Jungle','pumpkin-patch':'Pumpkin patch','river':'River','sandy-dunes':'Dunes','space':'Space','steampunk':'Steampunk','underwater':'Underwater','void':'Void','volcano':'Volcano','wonderland':'Wonderland','gnome-hollow':'Gnome Hollow','ember-river':'Ember River'};
for(const id of Object.keys(biomeLabels))biomeLabels[id]=titleCaseLabel(biomeLabels[id]);
const heartIcon='<svg class="ui-icon heart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const backgroundImages=new Map();
const blankScene=()=>({version:2,creationId:crypto.randomUUID(),items:[],palette:'haunted',background:'haze',moon:'none',galaxy:'none',shootingStars:false,weather:[],motion:true,motionPreference:'auto',promptId:null,promptHidden:false,seed:8921});
let draftScope=null,draftEnabled=false,draftTimer=null,draftInFlight=false,draftPending=null,draftSignature='',draftCloudReady=false;
let state=blankScene(),undoStack=[],redoStack=[],favorites=new Set(),favoritesOnly=false,favoritePending=new Set(),selected=null,oddityCategory='all',mode='move',activeUid=null,ready=false,catalogReady=false,busy=false,keyboard=false,cursor={x:600,y:600},drag=null,transformGesture=null,pinchGesture=null,toastTimer,pendingToast=null,animationId=0,animationTime=0,accountReady=false,signedIn=null,accountChecked=false,pendingSave=null,collection='album',albumSort='newest',albumHistoryRenderedSort='newest',albumHistorySorts={album:'newest',history:'newest'},albumHistoryOpening=false,nextOffset=null,albumHistoryGeneration=0;
const motionMedia=window.matchMedia?.('(prefers-reduced-motion: reduce)');let reducedMotion=motionMedia?.matches||false,canvasVisible=true;
const clone=value=>JSON.parse(JSON.stringify(value));
const snapshot=()=>clone(state);
const uid=()=>crypto.randomUUID();
const activeOddity=()=>state.items.find(x=>x.uid===activeUid);
function remember(before=snapshot()){undoStack.push(clone(before));if(undoStack.length>80)undoStack.shift();redoStack=[];}
const dialogReturnFocus=new WeakMap(),dialogStack=[];let toastReturnFocus=null;
function activeDialog(){return [...dialogStack].reverse().find(dialog=>dialog.open)||null;}
function focusSafely(target){const top=activeDialog(),visible=value=>value&&value.isConnected!==false&&!value.disabled&&(!value.getClientRects||value.getClientRects().length);if(top){if(visible(target)&&top.contains(target))target.focus({preventScroll:true});return;}const fallback=document.body.classList.contains('grove-view')?$('#returnToEditing'):$('#userMenuButton');(visible(target)?target:visible(fallback)?fallback:canvas)?.focus?.({preventScroll:true});}
function showDialog(dialog,focusTarget=document.activeElement){if(typeof savedMenu!=='undefined'&&savedMenu&&dialog!==$('#albumHistoryDialog'))focusTarget=isMobilePicker()?savedMenu.cardTrigger:savedMenu.button;dialogReturnFocus.set(dialog,focusTarget);const prior=dialogStack.indexOf(dialog);if(prior>=0)dialogStack.splice(prior,1);dialogStack.push(dialog);dialog.showModal();}
function notify(text,kind='info',compact=false){if(busy||activityStates.size){pendingToast={text,kind,compact};return;}const toast=$('#toast'),host=activeDialog()||$('main');if(toast.parentElement!==host)host.append(toast);toast.dataset.kind=kind;toast.classList.toggle('compact',compact);toast.textContent=text;toast.hidden=false;toast.setAttribute('role',kind==='error'?'alert':'status');toast.setAttribute('aria-live',kind==='error'?'assertive':'polite');if(kind==='error'){toastReturnFocus=document.activeElement;const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='toast-dismiss';dismiss.textContent='Dismiss';dismiss.addEventListener('click',dismissToast);toast.append(dismiss);}toast.classList.add('show');clearTimeout(toastTimer);toastTimer=kind==='error'?null:setTimeout(dismissToast,2100);}

function syncFeedback(){const active=busy||activityStates.size;$('#activityStatus').hidden=busy||!activityStates.size;$('#activityText').textContent=[...activityStates.values()].at(-1)||'';if(active){clearTimeout(toastTimer);$('#toast').classList.remove('show');$('#toast').hidden=true;}else if(pendingToast){const message=pendingToast;pendingToast=null;notify(message.text,message.kind,message.compact);}}
function setBusy(value,text='Saving your memory…'){busy=value;if(value&&typeof floatingPanels!=='undefined')for(const key of Object.keys(floatingPanels))closeFloating(key);if(value&&typeof dropdowns!=='undefined')for(const key of Object.keys(dropdowns))closeDropdown(key);if(value)$('#loading').classList.add('gone');$('#busyOverlay').hidden=!value;$('#busyOverlay').classList?.toggle('is-waking-grove',value&&text==='Waking the grove...');$('.canvas-wrap').classList.toggle('is-busy',value);$('#busyText').textContent=text;document.querySelectorAll('button,input,select').forEach(x=>{if(!x.hasAttribute?.('data-audio-control')&&!x.hasAttribute?.('data-busy-allowed')&&!x.closest?.('#startDialog'))x.disabled=(value||!ready)&&!(!ready&&x.hasAttribute?.('data-boot-picker'));});$('main').removeAttribute?.('aria-busy');canvas.setAttribute?.('aria-busy',String(value));syncFeedback();if(!value)updateControls();}
function rand(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function dimensions(item){const s=sprites.get(item.id);if(!s)return{w:0,h:0};const m=Math.max(s.width,s.height),size=Math.min(MAX_SIZE,item.size*(byId[item.id]?.renderScale||1));return{w:s.width/m*size,h:s.height/m*size};}
function makeOddity(id,x,y,size){const c=byId[id];if(!c)throw Error('Unknown item');const item={uid:uid(),order:state.items.reduce((max,item,i)=>Math.max(max,item.order??i),-1)+1,id,x,y,size:Math.min(MAX_SIZE,Math.max(40,size||c.size)),flip:false,flipY:false,rotation:0};return item;}
function placeOddity(id,x,y){if(!ready||busy)return false;if(!id)return false;if(state.items.length>=100)return false;remember();const item=makeOddity(id,x,y);state.items.push(item);activeUid=item.uid;render();noteProgress('first_item');return true;}
function announceOddityAdded(id){
 const text=byId[id].name+' Added';
 const status=$('#oddityAddedStatus');status.textContent='';
 // Announce when the canvas is exposed, after the picker closes if needed.
 requestAnimationFrame(()=>{status.textContent=text;});
}
function addOddity(id){if(!byId[id])return;const d=dimensions({id,size:byId[id].size});if(placeOddity(id,W/2,(H+d.h)/2)){window.groveAudio?.effect('add');announceOddityAdded(id);if(usesOddityModal())returnToCanvas();}}
let pickerDragController=null;import('./picker-drag.js').then(({installPickerDrag})=>pickerDragController=installPickerDrag({picker:$('#oddity-grid'),canvas,canStart:()=>ready&&!busy&&!document.body.classList.contains('grove-view')&&![...document.querySelectorAll('dialog')].some(d=>d.open),preview:id=>{const d=dimensions({id,size:byId[id].size}),r=canvas.getBoundingClientRect();return{src:thumbs.get(id),width:d.w*r.width/W,height:d.h*r.height/H};},place:(id,x,y)=>{const d=dimensions({id,size:byId[id].size});if(placeOddity(id,x*W,y*H+d.h/2)){window.groveAudio?.effect('add');announceOddityAdded(id);}}})).catch(()=>{});
function duplicateOddity(item){if(!item||busy||state.items.length>=100)return false;remember();const d=dimensions(item),offset=Math.max(70,Math.min(150,item.size*.18)),cx=item.x,cy=item.y-d.h/2;const copy={...clone(item),uid:uid(),order:state.items.reduce((max,value,i)=>Math.max(max,value.order??i),-1)+1,x:Math.max(-MAX_SIZE,Math.min(W+MAX_SIZE,item.x+(cx>W*.72?-offset:offset))),y:Math.max(-MAX_SIZE,Math.min(H+MAX_SIZE,item.y+(cy>H*.72?-offset:offset)))};state.items.push(copy);activeUid=copy.uid;render();window.groveAudio?.effect('copy');return true;}
function copyActive(){return duplicateOddity(activeOddity());}
async function loadFavorites(){showActivity('favorites','Loading favorite oddities…');try{const result=await request('/api/favorites');favorites=new Set(result.items.filter(id=>byId[id]));renderOddities();}catch{notify('Favorites could not load. Your creations are still available.','error');}finally{hideActivity('favorites');}}
async function toggleFavorite(itemId){if(busy||favoritePending.has(itemId))return;if(!requireAccount('sync your favorite oddities'))return;favoritePending.add(itemId);showActivity('favorite-'+itemId,'Saving favorite oddity…');renderOddities();try{const result=await request('/api/favorites',{method:'POST',body:JSON.stringify({itemId,favorite:!favorites.has(itemId)})});if(!result.saved)throw Error('The favorite was not saved.');result.favorite?favorites.add(itemId):favorites.delete(itemId);}catch(e){notify(e.message,'error');}finally{favoritePending.delete(itemId);hideActivity('favorite-'+itemId);renderOddities();}}
const itemAliases={'sleeping-cat':'orange ginger sleeping curled cat kitten feline','stretching-cat':'grey gray tabby stretching cat kitten feline','calico-cat':'calico orange black white sitting cat kitten feline',cat:'black cat walking', 'black-cat':'black cat sitting', 'willow-tree':'willow weeping tree', 'birch-tree':'birch tree', 'bare-tree':'bare leafless dead tree',bush:'bush shrub',horse:'horse pony equine', 'smoking-pipe':'smoking tobacco pipe',ribs:'rib cage ribs torso',bell:'ghost cap ghost mushroom',wavy:'wavy cap mushroom',toadstool:'spotted mushroom toadstool spots',bridge:'little bridge',sapling:'twisted tree crooked tree sapling','white-longhaired-cat':'white longhair longhaired fluffy rolling cat kitten feline', 'tuxedo-cat':'tuxedo dancing cat paw raised druid', 'cat-skull':'feline skull cat bones', 'jackalope-skull':'jackalope rabbit antler skull bones', snake:'reptile serpent', lizard:'reptile gecko', 'alien-antennae':'alien extraterrestrial antenna long', 'alien-cyclops':'cyclops mythical giant monster round one eye', beanstalk:'bean stalk vine giant plant', tadpole:'tadpole frog larva', turtle:'turtle reptile tortoise', butterfly:'butterfly insect wings', 'bird-nest':'bird nest twigs nesting', snowman:'snowman winter snow', fairy:'fairy faerie sprite magical', submarine:'submarine underwater boat vehicle', 'crystal-ball':'crystal ball fortune telling orb glass', cactus:'cactus succulent desert', raindrop:'rain drop weather water droplet', snowflake:'snowflake snow flake ice weather', chipmunk:'chipmunk rodent squirrel', dove:'dove pigeon bird', jellyfish:'jellyfish jelly fish ocean sea', shell:'shell seashell ocean sea', worm:'worm earthworm bug', caterpillar:'caterpillar insect larva bug', ladybug:'ladybug ladybird beetle bug insect', dragonfly:'dragonfly insect bug wings','crystal-point':'gem gemstone quartz amethyst point', 'crystal-heart':'gem gemstone quartz heart', 'crystal-sphere':'gem gemstone crystal ball sphere', kelpie:'mythical water horse spirit', 'will-o-the-wisp':'will o the wisp ghost spirit ghostlight light flame', gargoyle:'mythical gargoyle stone guardian', 'forest-spirit':'tiny forest spirit woodland sprite dryad', 'antique-key':'antique key old vintage brass', 'potion-bottle':'potion bottle single elixir vial', hourglass:'hourglass sand timer time', 'broken-column':'broken column pillar ruin stone', driftwood:'driftwood drift wood beach', 'lily-pad':'pond lily pad waterlily water lily leaf', feather:'single feather plume bird',seal:'pinniped ocean marine mammal', 'red-panda':'red panda firefox lesser panda', 'giant-panda':'giant panda bear bamboo', 'grizzly-bear':'grizzly brown bear', 'polar-bear':'polar arctic bear',jack:'jack o lantern carved pumpkin',teeth:'fang tooth','corner-web':'cobweb messy tangled web',bunny:'rabbit',idol:'satanic demon devil sculpture',pentagram:'satanic occult pentacle',ritualcircle:'satanic occult sigil ritual',gnome:'gnomes goblin',alien:'aliens extraterrestrial',ufo:'aliens spaceship saucer',fairyring:'mushrooms faerie fairy ring',flytrap:'carnivorous venus flytrap','shooting-star':'meteor shooting stars',clouds:'cloud sky',tornado:'storm cyclone',waterbear:'tardigrade water bear',trex:'t-rex dinosaur',triceratops:'dinosaur',nessie:'nessie loch ness monster','poppy-seeds':'poppy seed pods',cannabis:'marijuana weed pot drug'};
Object.assign(itemAliases,{fireflies:'firefly fireflies lightning bug lightning bugs'});
const oddityCategoryTerms={animals:'animal creature critter wildlife',characters:'character creature mythical cryptid monster',props:'prop object tool decoration',creatures:'creature animal critter',plants:'plant botanical flower flora vegetation',mushrooms:'fungi fungus mushroom toadstool',nature:'nature natural outdoor landscape',bones:'bone skeleton skeletal remains anatomy',structures:'structure building architecture furniture',magic:'magic magical occult witch witchcraft ritual haunted',sky:'sky celestial astronomy cosmic space'};
const relatedTerms={
 bird:['dove','owl','raven','falcon','phoenix','penguin'],cat:['cat','black-cat','sleeping-cat','stretching-cat','tuxedo-cat','white-longhaired-cat'],rabbit:['bunny','jackalope','rabbit-skull'],dinosaur:['trex','triceratops'],
 aquatic:['jellyfish','tadpole','turtle','kelpie','lily-pad','seal','dolphin','whale','manatee','octopus','squid','shrimp','starfish','nessie','kraken','coral','bubble','pond'],ocean:['jellyfish','shell','seal','dolphin','whale','manatee','octopus','squid','shrimp','starfish','kraken','coral','bubble'],
 bug:['butterfly','worm','caterpillar','ladybug','dragonfly','spider','web','orb-web','corner-web','mothman'],arachnid:['spider','web','orb-web','corner-web'],web:['web','orb-web','corner-web'],skull:['cat-skull','jackalope-skull','skull','rabbit-skull','deer-skull','wolf-skull','bird-skull'],
 flower:['rose','nightshade','lily','morning-glory','dandelion','poppy-seeds','clovers'],tree:['willow-tree','birch-tree','bare-tree','pine','sapling','stump','log','roots','vines'],
 storm:['clouds','tornado','lightning'],weather:['raindrop','snowflake','clouds','tornado','rainbow','lightning'],moon:['moon-full','moon-half','moon-crescent','moon-blood','lunar-eclipse','solar-eclipse'],galaxy:['galaxy-violet','galaxy-teal','galaxy-rose'],
 cryptid:['mothman','slender-man','chupacabra','bigfoot','jackalope','nessie'],mythical:['alien-cyclops','fairy','kelpie','will-o-the-wisp','gargoyle','forest-spirit','dragon','phoenix','unicorn','griffin','kraken','mothman','slender-man','chupacabra','bigfoot','jackalope','nessie'],
 fire:['flame','bonfire','candles','single-candle','lantern'],light:['will-o-the-wisp','flame','bonfire','candles','single-candle','lantern','sun','lightning'],pumpkin:['pumpkin','jack'],
 halloween:['pumpkin','jack','ghost','skull','bat','witch','cauldron','scarecrow','black-cat'],alien:['alien','alien-antennae','ufo'],satanic:['pentagram','ritualcircle','idol'],human:['skull','ribs','skeletal-arm','skeletal-leg','skeletal-hips','skeletal-hand','skeletal-foot']
};
const irregularWords={fungi:'fungus',mice:'mouse',teeth:'tooth',leaves:'leaf',bunnies:'bunny',faerie:'fairy',faeries:'fairy',bugs:'bug',knives:'knife',wolves:'wolf',feet:'foot',witches:'witch',foxes:'fox',birds:'bird'};
function searchWords(text){return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean).map(word=>irregularWords[word]||(/ies$/.test(word)?word.slice(0,-3)+'y':word.length>3&&word.endsWith('s')&&!word.endsWith('ss')?word.slice(0,-1):word));}
const searchIndex=new Map(oddityCatalog.map(item=>[item.id,new Set(searchWords([item.name,item.id==='alien-cyclops'?'cyclops':item.id,oddityCategoryTerms[item.oddityCategory],item.oddityCategory,itemAliases[item.id]||'',...Object.entries(relatedTerms).filter(([,ids])=>ids.includes(item.id)).map(([term])=>term),'oddity item'].join(' ')))]));
function matchesSearch(item,query){const words=searchIndex.get(item.id);return searchWords(query).every(term=>[...words].some(word=>word===term||word.startsWith(term)));}
const odditySearchEasterEggs=new Map([
 [['test','testing','check'],'<span>The mushrooms hear your call.</span><span>It echoes through the forest.</span>'],
 [['penis','dick','cock','willy','dong','schlong'],'<span>Wrong kind of mushroom.</span><span>May your journey be fruitful.</span>'],
 [['boob','boobs','boobies','breast','breasts','tits','bosom','bewbs','bewb','bewbz','tiddies','tiddy','titt','titty','titties'],'<span>Lovely hills.</span><span>Have you tried the Biome menu?</span>'],
 [['poo','poop','dung','feces','faeces','shit','turd','dookie','poopie','poopy'],'<span>The dung beetles carry it underground.</span><span>What returns to the soil helps new life grow.</span>'],
 [['vag','vagina','vaginas','vulva','pussy','pussies','puss','cooch'],'<span>The most magical secret garden of all.</span>'],
].flatMap(([queries,message])=>queries.map(query=>[query,message])));
function odditySearchEasterEgg(query){
 for(const word of query.match(/[\p{L}\p{M}\p{N}_]+/gu)??[]){
  const message=odditySearchEasterEggs.get(word);
  if(message)return message;
 }
}
function renderOddities(){if(!catalogReady)return;syncOddityCategoryPicker();const el=$('#oddity-grid'),query=$('#odditySearch').value.trim().toLowerCase(),focused=document.activeElement,focusedCard=focused?.closest?.('.oddity-card'),focusState=focusedCard&&el.contains(focused)?{id:focusedCard.dataset.id,index:[...el.children].indexOf(focusedCard),heart:focused.classList.contains('favorite-heart'),left:el.scrollLeft,top:el.scrollTop}:null;const restoreFocus=()=>{if(!focusState)return;el.scrollLeft=focusState.left;el.scrollTop=focusState.top;const cards=[...el.children].filter(x=>x.classList?.contains('oddity-card')),card=cards.find(x=>x.dataset.id===focusState.id)||cards[Math.min(focusState.index,cards.length-1)],button=card?.querySelector?.(focusState.heart?'.favorite-heart':'.oddity-tile')||$('#favoriteFilter');if(!button.disabled)button.focus({preventScroll:true});};const entries=oddityCatalog.filter(v=>!v.hidden&&(favoritesOnly?favorites.has(v.id):query||oddityCategory==='all'?true:v.oddityCategory===oddityCategory)&&(!query||matchesSearch(v,query))).sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));el.classList.add('oddity-grid');el.classList.toggle('empty-favorites',favoritesOnly&&favorites.size===0&&entries.length===0);el.classList.toggle('many',entries.length>6);el.classList.toggle('search-results',!!query);const shortResults=!!(query||favoritesOnly||oddityCategory!=='all')&&entries.length>0&&entries.length<=6;el.classList.toggle('short-results',shortResults);el.style.setProperty?.('--result-columns',String(entries.length<=2?entries.length:Math.ceil(entries.length/2)));el.style.setProperty?.('--result-rows',String(entries.length<=2?1:2));el.replaceChildren();$('#favoriteFilter').setAttribute('aria-pressed',String(favoritesOnly));$('#favoriteFilter').setAttribute('aria-label',favoritesOnly?'Show All Oddities':'Show Favorite Oddities');$('#favoriteFilter').title=favoritesOnly?'Show All Oddities':'Show Favorite Oddities';$('#catalogCount').textContent=favoritesOnly?entries.length+' '+(entries.length===1?'favorite':'favorites'):query?entries.length+' '+(entries.length===1?'match':'matches'):entries.length+' '+({all:'items',mushrooms:'fungi',nature:'natural objects',magic:'magical objects',sky:'sky objects'}[oddityCategory]||oddityCategory);if(!entries.length){const p=document.createElement('p');p.className='search-empty';if(favoritesOnly)p.innerHTML='Tap '+heartIcon+'<span class="sr-only">a heart</span> on an oddity to favorite it.';else{p.className+=' search-no-results';p.innerHTML=odditySearchEasterEgg(query)??'<span>Nothing lurking by that name.</span><span>Try another term.</span>';}el.append(p);if(favoritesOnly&&favorites.size===0&&usesOddityModal()){const browse=document.createElement('button');browse.id='browseOddities';browse.type='button';browse.textContent='Browse Oddities';browse.addEventListener('click',()=>{oddityCategory='all';$('#favoriteFilter').click();$('#odditySearch').focus({preventScroll:true});});el.append(browse);}restoreFocus();return;}for(const item of entries){const card=document.createElement('div');card.className='oddity-card';card.dataset.id=item.id;const b=document.createElement('button');b.className='oddity-tile';b.setAttribute('aria-label','Add '+item.name+' to the center');b.title='Add '+item.name;b.dataset.id=item.id;b.disabled=busy;const im=document.createElement('img');im.alt='';im.draggable=false;im.src=thumbs.get(item.id);b.append(im,document.createTextNode(item.name));b.addEventListener('click',()=>addOddity(item.id));const heart=document.createElement('button');heart.className='favorite-heart'+(signedIn===false?' requires-sign-in':'');heart.innerHTML=heartIcon;heart.setAttribute('aria-pressed',String(favorites.has(item.id)));heart.setAttribute('aria-label',(favorites.has(item.id)?'Remove ':'Add ')+item.name+(favorites.has(item.id)?' from favorites':' to favorites'));heart.disabled=busy;heart.setAttribute('aria-disabled',String(busy||favoritePending.has(item.id)));heart.addEventListener('click',()=>toggleFavorite(item.id));const handle=document.createElement('button');handle.className='oddity-drag-handle';handle.dataset.id=item.id;handle.type='button';handle.textContent='✥';handle.setAttribute('aria-label','Drag '+item.name+' to canvas, or activate to add in center');handle.title='Drag to canvas';handle.disabled=busy;handle.addEventListener('click',()=>addOddity(item.id));card.append(b,heart,handle);el.append(card);}restoreFocus();}
function drawSprite(target,id,x,y,size,flip=false,hue=0,flipY=false,filter='',rotation=0){const s=sprites.get(id);if(!s)return;const scale=Math.min(MAX_SIZE,size*(byId[id]?.renderScale||1))/Math.max(s.width,s.height),w=s.width*scale,h=s.height*scale;target.save();target.translate(x,y-h/2);target.rotate((rotation||0)*Math.PI/180);target.scale(flip?-1:1,flipY?-1:1);if(hue||filter)target.filter=[hue?`hue-rotate(${hue}deg)`:'',filter].filter(Boolean).join(' ');target.drawImage(s,-w/2,-h/2,w,h);target.restore();}
function blankColor(p){const colors={haunted:'#eee7f2',candy:'#f7e8e8',bog:'#edf1dd',dusk:'#eee6f5',monochrome:'#ededed',ember:'#f8e8d4',ocean:'#e3eff4',spectral:'#e7f1e2'};return colors[Object.keys(colorOptions).find(key=>colorOptions[key]===p)]||colors.haunted;}
const sceneLayerCache=new Map(),backgroundLayerCache=new Map();
function sceneBackground(scene){const key=scene.background+':'+scene.palette;if(backgroundLayerCache.has(key)){const value=backgroundLayerCache.get(key);backgroundLayerCache.delete(key);backgroundLayerCache.set(key,value);return value;}const background=document.createElement('canvas');background.width=W;background.height=H;const target=background.getContext('2d'),p=colorOptions[scene.palette]||colorOptions.haunted;target.save();
target.fillStyle=scene.background==='void'?'#140e1c':scene.background==='none'?blankColor(p):p.bg;target.fillRect(0,0,W,H);const bg=scene.background==='void'?null:backgroundImages.get(scene.background);if(bg){const scale=Math.max(W/bg.width,H/bg.height);target.save();target.filter=[p.hue?`hue-rotate(${p.hue}deg)`:'',p.filter].filter(Boolean).join(' ')||'none';target.drawImage(bg,(W-bg.width*scale)/2,(H-bg.height*scale)/2,bg.width*scale,bg.height*scale);target.restore();if(p.tint){target.save();target.globalCompositeOperation='soft-light';target.globalAlpha=p.tintAlpha;target.fillStyle=p.tint;target.fillRect(0,0,W,H);target.restore();}}
target.restore();backgroundLayerCache.set(key,background);while(backgroundLayerCache.size>2)backgroundLayerCache.delete(backgroundLayerCache.keys().next().value);return background;}
function sceneLayers(scene){const key=JSON.stringify([scene.background,scene.palette,scene.galaxy,scene.moon,scene.shootingStars,scene.weather.includes('lightning'),scene.items]);if(sceneLayerCache.has(key)){const value=sceneLayerCache.get(key);sceneLayerCache.delete(key);sceneLayerCache.set(key,value);return value;}const background=sceneBackground(scene),foreground=document.createElement('canvas');foreground.width=W;foreground.height=H;const target=foreground.getContext('2d'),p=colorOptions[scene.palette]||colorOptions.haunted;target.save();
const time=0,still=true;
if(scene.galaxy!=='none'){target.save();target.globalAlpha=.8;drawSprite(target,'galaxy-'+scene.galaxy,590,775,730,false,p.hue,false,p.filter);target.restore();}
if(scene.moon!=='none')drawSprite(target,'moon-'+scene.moon,990,250,155,false,p.hue,false,p.filter);
if(scene.weather.includes('lightning'))drawSprite(target,'lightning',235,280,240,false,p.hue,false,p.filter);
drawShootingStars(target,time,still,scene);
for(const item of [...scene.items].sort((a,b)=>(a.order??scene.items.indexOf(a))-(b.order??scene.items.indexOf(b)))){target.save();drawSprite(target,item.id,item.x,item.y,item.size,item.flip,p.hue,!!item.flipY,p.filter,item.rotation||0);target.restore();}
target.restore();const value={background,foreground};sceneLayerCache.set(key,value);while(sceneLayerCache.size>2)sceneLayerCache.delete(sceneLayerCache.keys().next().value);return value;}
function draw(target,scene=state,time=0,still=true,effects=true,exportLoop=false){const p=colorOptions[scene.palette]||colorOptions.haunted,layers=sceneLayers(scene),frameTime=still?0:time;target.clearRect(0,0,W,H);target.save();target.drawImage(layers.background,0,0);if(effects)window.GroveEnvironment?.draw(target,scene,frameTime,layers.background,exportLoop,p);target.drawImage(layers.foreground,0,0);if(effects)window.GroveMotion?.draw(target,scene,frameTime,p,drawSprite,exportLoop);target.restore();}
function drawShootingStars(target,time=0,still=false,scene=state){if(!scene.shootingStars)return;for(let i=0;i<3;i++){const p=[.25,.54,.8][i];target.save();target.globalAlpha=Math.max(.15,Math.sin(p*Math.PI))*.9;drawSprite(target,'shooting-star',40+p*(W+150),80+p*450+i*85,155+i*22,false,colorOptions[scene.palette].hue,false,colorOptions[scene.palette].filter);target.restore();}}
const motionPreferenceKey='spooky-grove-motion-v1';let savedMotionPreference=null;try{const value=JSON.parse(localStorage.getItem(motionPreferenceKey)||'null');if(typeof value==='boolean')savedMotionPreference=value;}catch{}
function sceneMotionChoice(scene=state){if(typeof savedMotionPreference==='boolean')return savedMotionPreference;return typeof scene.motionPreference==='boolean'?scene.motionPreference:scene.motionPreference==='auto'?'auto':scene.motion===false?false:'auto';}
function motionEnabled(scene=state){const choice=sceneMotionChoice(scene);return choice==='auto'?!reducedMotion:choice;}
function hasAnimation(scene=state){return motionEnabled(scene)&&!!window.GroveMotion?.hasMotion(scene);}
function paintFrame(time=0){const moving=motionEnabled();draw(ctx,state,moving?time:0,false);const item=activeOddity();if(item&&!document.body.classList.contains('grove-view')){const d=dimensions(item);ctx.save();ctx.translate(item.x,item.y-d.h/2);ctx.rotate((item.rotation||0)*Math.PI/180);ctx.strokeStyle='#fff2f8';ctx.lineWidth=4;ctx.setLineDash([10,7]);ctx.strokeRect(-d.w/2-8,-d.h/2-8,d.w+16,d.h+16);ctx.restore();}}
function animate(time){animationId=0;if(document.hidden||!canvasVisible||!hasAnimation())return;if(time-animationTime>=50){animationTime=time;paintFrame(time);}animationId=requestAnimationFrame(animate);}
function manageAnimation(){if(animationId)cancelAnimationFrame(animationId);animationId=0;paintFrame(animationTime);if(hasAnimation()&&!document.hidden&&canvasVisible)animationId=requestAnimationFrame(animate);}
motionMedia?.addEventListener?.('change',event=>{reducedMotion=event.matches;if(ready){manageAnimation();syncMotionControl();}});
if(typeof IntersectionObserver==='function'){const observer=new IntersectionObserver(entries=>{canvasVisible=entries[0]?.isIntersecting!==false;if(ready)manageAnimation();},{threshold:0});observer.observe(canvas);window.addEventListener('pagehide',()=>observer.disconnect());window.addEventListener('pageshow',()=>observer.observe(canvas));}
function syncMotionControl(){$('#motionToggle').checked=motionEnabled();$('#motionToggle').disabled=busy||!ready;const automatic=sceneMotionChoice()==='auto';$('#motionStatus').textContent=automatic&&reducedMotion?'Your device prefers reduced motion. You can turn Animations on here.':'';$('#motionStatus').hidden=!$('#motionStatus').textContent;}
$('#motionToggle').addEventListener('change',event=>{if(busy)return;remember();savedMotionPreference=event.target.checked;try{localStorage.setItem(motionPreferenceKey,JSON.stringify(savedMotionPreference));}catch{}state.motion=event.target.checked;state.motionPreference=event.target.checked;render();});
document.addEventListener('grove-view-change',()=>{if(ready)paintFrame(animationTime);});
const ideaById=Object.fromEntries((window.GroveIdeas||[]).map(idea=>[idea.id,idea]));
const freeCreateChoice=$('#freeCreate');let pendingIdea=null,selectedGroveChoice=null,displayedIdeas=[],remainingIdeas=[];
function syncPromptReminder(){const idea=ideaById[state.promptId];$('#promptReminder').hidden=!idea||!!state.promptHidden;$('#promptTitle').textContent=idea?.title||'';$('#promptText').textContent=idea?.text||'';}
$('#dismissPrompt').addEventListener('click',()=>{state.promptHidden=true;syncPromptReminder();queueDraft();});
function ideaCard(tag,idea){
 const card=document.createElement(tag),slot=document.createElement('span'),copy=document.createElement('span'),title=document.createElement('strong'),text=document.createElement('span');
 const icon=document.createElement('img');icon.className='idea-oddity';icon.alt='';icon.width=icon.height=24;
 if(tag==='button')icon.dataset.ideaOddity=idea.oddity;
 card.className='idea-choice';slot.className='idea-oddity-slot';copy.className='idea-copy';text.className='idea-description';
 title.textContent=idea.title;text.textContent=idea.text;slot.append(icon);copy.append(title,text);card.append(slot,copy);return card;
}
function syncIdeaOddityIcons(){
 for(const icon of $('#startDialog').querySelectorAll('img[data-idea-oddity]:not([src])')){
  const thumbnail=thumbs.get(icon.dataset.ideaOddity);if(thumbnail)icon.src=thumbnail;
 }
}
function nextIdeaPair(allIdeas,reset=false){
 if(reset||!remainingIdeas.length){
  const ideas=[...allIdeas];
  for(let i=ideas.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ideas[i],ideas[j]]=[ideas[j],ideas[i]];}
  if(!reset&&ideas.length>=4){
   const previous=new Set(displayedIdeas.map(idea=>idea.id));
   for(let i=0;i<2;i++)if(previous.has(ideas[i].id)){
    const j=ideas.findIndex((idea,index)=>index>i&&!previous.has(idea.id));[ideas[i],ideas[j]]=[ideas[j],ideas[i]];
   }
  }
  remainingIdeas=ideas;
 }
 return remainingIdeas.splice(0,2);
}
function fillIdeas(reset=false){
 const allIdeas=window.GroveIdeas||[];
 displayedIdeas=nextIdeaPair(allIdeas,reset);
 if(pendingIdea&&pendingIdea!=='free'&&!displayedIdeas.some(idea=>idea.id===pendingIdea))pendingIdea=null;
 const area=$('#ideaChoices');area.replaceChildren();
 for(const [index,idea] of displayedIdeas.entries()){
  const button=ideaCard('button',idea);button.type='button';button.dataset.ideaId=idea.id;button.style.gridRow=String(index+1);
  button.addEventListener('click',()=>selectGroveIdea(idea.id));area.append(button);
 }
 area.append(freeCreateChoice);
 const sizing=document.createElement('div');sizing.className='idea-size-rack';sizing.setAttribute('aria-hidden','true');
 for(const idea of allIdeas)sizing.append(ideaCard('div',idea));
 area.append(sizing);syncIdeaOddityIcons();syncGroveIdeaSelection();
}
function syncGroveIdeaSelection(){
 const chooser=$('#ideaStep'),review=$('#ideaReviewStep'),title=$('#startTitle'),idea=ideaById[pendingIdea],isFree=pendingIdea==='free';
 const selected=isFree||!!idea;
 chooser.hidden=selected;chooser.inert=selected;review.hidden=!selected;
 title.textContent=selected?'Start this grove?':'Find your inspiration';
 $('#reviewIdeaTitle').textContent=isFree?freeCreateChoice.querySelector('strong').textContent:idea?.title||'';
 $('#reviewIdeaDescription').textContent=isFree?freeCreateChoice.querySelector('.idea-description').textContent:idea?.text||'';
 const icon=$('#reviewIdeaOddity'),oddity=isFree?freeCreateChoice.querySelector('.idea-oddity').dataset.ideaOddity:idea?.oddity||'';
 if(icon.dataset.ideaOddity!==oddity){icon.dataset.ideaOddity=oddity;icon.removeAttribute('src');}
 if(selected)syncIdeaOddityIcons();
 $('#startGrove').disabled=!selected;
}
function selectGroveIdea(id){
 if(!$('#startDialog').open||id!=='free'&&!displayedIdeas.some(idea=>idea.id===id))return;
 pendingIdea=id;syncGroveIdeaSelection();$('#startTitle').focus({preventScroll:true});
}
function scrollNewGroveToTop(){window.scrollTo?.({top:0,left:0,behavior:'instant'});}
function chooseGroveStart(){
 return new Promise(resolve=>{
  const dialog=$('#startDialog');pendingIdea=null;selectedGroveChoice=null;fillIdeas(true);dialog.returnValue='cancel';
  dialog.addEventListener('close',()=>resolve(dialog.returnValue==='start'?selectedGroveChoice:null),{once:true});
  showDialog(dialog,canvas);$('#ideaChoices').querySelector?.('button')?.focus({preventScroll:true});
 });
}
$('#startDialog').addEventListener('cancel',event=>event.preventDefault());
$('#freeCreate').addEventListener('click',()=>selectGroveIdea('free'));$('#shuffleIdeas').addEventListener('click',()=>fillIdeas());
$('#chooseAnotherIdea').addEventListener('click',clearGroveIdeaSelection);
$('#startGrove').addEventListener('click',finishGroveSetup);
function clearGroveIdeaSelection(){
 const choice=[...$('#ideaChoices').querySelectorAll('button[data-idea-id]')].find(button=>button.dataset.ideaId===pendingIdea);
 pendingIdea=null;syncGroveIdeaSelection();choice?.focus({preventScroll:true});
}
function finishGroveSetup(){
 const dialog=$('#startDialog');if(!dialog.open||!pendingIdea||selectedGroveChoice)return;
 if(pendingIdea==='free'){
  const excluded=new Set(displayedIdeas.map(idea=>idea.biome));
  const choices=biomeNames.filter(name=>name!=='none'&&!excluded.has(name));
  selectedGroveChoice={background:choices[Math.floor(Math.random()*choices.length)]||'haze',promptId:null};
 }else{
  const idea=ideaById[pendingIdea];if(!idea)return;
  selectedGroveChoice={background:idea.biome||'haze',promptId:idea.id};
 }
 dialog.returnValue='start';dialog.close();scrollNewGroveToTop();
}
async function startNewGrove(first=false,initialChoice=null){
 if(busy||!ready||$('#startDialog').open)return;
 if(!first&&!requireAccount('keep your current creation before starting a new grove'))return;
 const previous=snapshot();
 if(!first&&!await confirmation('clear'))return;
 const choice=initialChoice||await chooseGroveStart();if(!choice)return;
 if(JSON.stringify(state)!==JSON.stringify(previous)){
  window.groveAudio?.cancelGroveTrack?.();return;
 }
 const next={...blankScene(),...choice,motion:previous.motion!==false,motionPreference:sceneMotionChoice(previous)};
 setBusy(true,'Waking the grove...');
 try{
  const prepared=await prepareScene(next);
  if(!first)await persistScene('history',previous,'Before starting a new grove');
  remember();state=next;selected=null;activeUid=null;if(first)armFirstOddityGuide();
  window.groveAudio?.chooseGroveTrack?.(choice.promptId);render(prepared);
  if(first)markOnboardingComplete();scrollNewGroveToTop();
 }catch(error){window.groveAudio?.cancelGroveTrack?.();const message=error.message.trim();notify(/Your (?:creation|last confirmed save) is unchanged\./.test(message)?message:message+' Your creation is unchanged.','error');}
 finally{setBusy(false);}
}

const badgeDefinitions=window.GroveBadges||[],badgeById=Object.fromEntries(badgeDefinitions.map(b=>[b.id,b]));
let progressKey=null,progressGeneration=0,progressTask=null,progressAgain=false,progressState={earned:[],savedCount:0,biomeCount:0},progressError='';const progressQueues=new Map();
const currentProgressKey=()=>signedIn&&draftScope?draftScope:signedIn===false?'guest':null;
function progressQueue(key){if(progressQueues.has(key))return progressQueues.get(key);let values=[];try{const stored=JSON.parse(localStorage.getItem('grove-progress-pending-'+key)||'[]');if(Array.isArray(stored))values=stored.filter(x=>['first_item','share','download'].includes(x.type)).slice(0,30);}catch{}progressQueues.set(key,values);return values;}
function keepProgressQueue(key,values){progressQueues.set(key,values);try{localStorage.setItem('grove-progress-pending-'+key,JSON.stringify(values));}catch{}}
function resetProgressContext(){const key=currentProgressKey();if(key===progressKey)return false;progressKey=key;progressGeneration++;progressTask=null;progressAgain=false;progressError='';progressState={earned:[],savedCount:0,biomeCount:0};if(key==='guest'){try{const value=JSON.parse(localStorage.getItem('grove-guest-progress')||'null');if(value)progressState={...progressState,earned:(value.earned||[]).filter(x=>badgeById[x.id])};}catch{}}renderAchievements();return true;}
function useProgress(value,key){if(key!==currentProgressKey()||value.scope!==key)return;progressState={earned:(value.earned||[]).filter(x=>badgeById[x.id]),savedCount:Math.max(0,Number(value.savedCount)||0),biomeCount:Math.max(0,Number(value.biomeCount)||0)};renderAchievements();}
function renderAchievements(){
 const grid=$('#achievementGrid');if(!grid)return;
 const earned=new Set(progressState.earned.map(x=>x.id)),total=badgeDefinitions.length,unlocked=badgeDefinitions.filter(badge=>earned.has(badge.id)).length;
 $('#achievementProgress').textContent=unlocked+'/'+total;
 $('#achievementProgressLabel').textContent=unlocked+' of '+total+' achievements unlocked';
 grid.replaceChildren();
 for(const badge of badgeDefinitions){
  const done=earned.has(badge.id),card=document.createElement('article'),art=document.createElement('div'),image=document.createElement('img'),body=document.createElement('div'),title=document.createElement('h3'),criteria=document.createElement('p'),status=document.createElement('span');
  card.className='achievement-card'+(done?' earned':'');art.className='achievement-art';
  const thumb=thumbs.get(badge.icon);if(thumb)image.src=thumb;
  image.alt='';art.append(image);title.textContent=badge.title;criteria.textContent=badge.text;
  if(done)title.insertAdjacentHTML('beforeend','<svg class="achievement-check" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>');
  status.className='sr-only';status.textContent=done?'Unlocked':'Locked';
  body.append(title,criteria,status);card.append(art,body);grid.append(card);
 }
 $('#achievementStatus').textContent=progressError||(progressTask?'Updating achievements…':'');$('#achievementStatus').classList.toggle('is-loading',!!progressTask&&!progressError);$('#achievementStatus').hidden=!$('#achievementStatus').textContent;$('#retryAchievements').hidden=!progressError||progressKey==='guest';$('#achievementSignIn').hidden=true;
}
async function syncAchievements(){resetProgressContext();const key=progressKey;if(!key||key==='guest'){renderAchievements();return;}if(progressTask){progressAgain=true;return progressTask;}const generation=progressGeneration;progressError='';const task=(async()=>{try{while(progressQueue(key).length){if(generation!==progressGeneration)return;const event=progressQueue(key)[0],result=await request('/api/achievements/event',{method:'POST',body:JSON.stringify({...event,scope:key})});if(generation!==progressGeneration)return;useProgress(result,key);keepProgressQueue(key,progressQueue(key).filter(x=>x.key!==event.key));}let more=true;while(more){const result=await request('/api/achievements/sync',{method:'POST',body:JSON.stringify({scope:key})});if(generation!==progressGeneration)return;useProgress(result,key);more=!!result.hasMore;}}catch(error){if(generation===progressGeneration)progressError='Progress could not be saved in this browser. Your creation is unchanged.';}finally{if(generation===progressGeneration){progressTask=null;const again=progressAgain;progressAgain=false;renderAchievements();if(again)await syncAchievements();}}})();progressTask=task;renderAchievements();return task;}
function noteProgress(type){const badge={first_item:'first-item',share:'share-a-grove',download:'take-it-with-you'}[type];if(!badge)return;resetProgressContext();const key=progressKey;if(!key)return;if(key==='guest'){if(!progressState.earned.some(x=>x.id===badge))progressState.earned.push({id:badge,earnedAt:Date.now()});try{const previous=JSON.parse(localStorage.getItem('grove-guest-progress')||'{}');localStorage.setItem('grove-guest-progress',JSON.stringify({...previous,...progressState}));}catch{}renderAchievements();return;}if(progressState.earned.some(x=>x.id===badge))return;if(!progressQueue(key).some(x=>x.key===type))keepProgressQueue(key,[...progressQueue(key),{key:type,type}]);syncAchievements();}
$('#openAchievements').addEventListener('click',()=>{closeFloating('user');resetProgressContext();showDialog($('#achievementDialog'),$('#userMenuButton'));syncAchievements();$('#closeAchievements').focus({preventScroll:true});});$('#closeAchievements').addEventListener('click',()=>$('#achievementDialog').close());$('#retryAchievements').addEventListener('click',syncAchievements);$('#achievementSignIn').addEventListener('click',()=>requireAccount('keep achievements with your account'));window.addEventListener('focus',()=>{if(currentProgressKey())syncAchievements();});

function selectionName(item){if(!item)return '';const name=byId[item.id].name,peers=state.items.map((value,index)=>({value,index})).filter(x=>byId[x.value.id]?.name===name).sort((a,b)=>(a.value.order??a.index)-(b.value.order??b.index)||a.index-b.index);return name+(peers.length>1?' '+(peers.findIndex(x=>x.value.uid===item.uid)+1):'');}
function updateControls(){if(!ready)return;syncFirstOddityGuide();document.querySelectorAll('.favorite-heart').forEach(button=>{const blocked=busy||favoritePending.has(button.closest('.oddity-card').dataset.id);button.disabled=blocked;button.setAttribute('aria-disabled',String(blocked));});syncMotionControl();$('#undo').disabled=busy||!undoStack.length;$('#redo').disabled=busy||!redoStack.length;$('#undo').title='Undo ('+undoStack.length+' steps available)';$('#redo').title='Redo ('+redoStack.length+' steps available)';$('#saveAlbum').disabled=busy;$('#openAlbum').disabled=busy;$('#openHistory').disabled=busy;$('#transformTools').hidden=!activeOddity();$('#outputTools').hidden=!!activeOddity();$('#flipHorizontal').setAttribute('aria-pressed',String(!!activeOddity()?.flip));$('#flipVertical').setAttribute('aria-pressed',String(!!activeOddity()?.flipY));syncDragSurface();syncHandles();$('#selectionHint').textContent=selectionName(activeOddity());$('#selectionHint').title=selectionName(activeOddity());const item=activeOddity(),d=item?dimensions(item):null,status=item?selectionName(item)+'. '+Math.round(Math.max(d.w,d.h)/W*100)+' percent size, '+Math.round(item.rotation||0)+' degrees. '+Math.round(item.x/W*100)+' percent across, '+Math.round((item.y-d.h/2)/H*100)+' percent down.':'No item selected.';if($('#canvasSelectionStatus').textContent!==status)$('#canvasSelectionStatus').textContent=status;$('#toggleOddities').hidden=!!activeOddity();}

function render(prepared=null){if(!ready)return;manageAnimation();$('#biomeChoice').value=state.background;syncBiomePicker();$('.garden-panel').classList.toggle('void-grove',state.background==='void');document.querySelectorAll('[data-palette]').forEach(b=>{b.classList.toggle('active',b.dataset.palette===state.palette);b.setAttribute('aria-pressed',String(b.dataset.palette===state.palette));});syncSceneChoices();syncPromptReminder();syncMotionControl();updateControls();queueDraft();}
function syncSceneChoices(){const weather=state.weather.length?state.weather.map(weatherLabel).join(' + '):'Clear',palette=colorOptions[state.palette].name,currentWeather=!state.weather.length?'clear':state.weather.length===1&&weatherChoices.some(option=>option.value===state.weather[0])?state.weather[0]:'legacy',entries=currentWeather==='legacy'?[...weatherChoices,{value:'legacy',label:weather}]:weatherChoices;$('#weatherChoice').value=currentWeather;syncDropdown('weather',entries,currentWeather,'Clear');$('#weatherButton').setAttribute('aria-label','Weather: '+weather);$('#weatherButton').title='Weather: '+weather;$('#colorButton').setAttribute('aria-label','Color: '+palette);$('#colorButton').title='Color: '+palette;$('#biomeButton').title='Biome: '+biomeLabels[state.background];}
function loadBackground(name){if(name==='none'||name==='void'||backgroundImages.has(name))return Promise.resolve();if(!biomeNames.includes(name))return Promise.reject(Error('Unknown biome'));return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{backgroundImages.set(name,image);resolve();};image.onerror=()=>reject(Error('The '+biomeLabels[name]+' biome could not load. Refresh the page and try again. Your creation is unchanged.'));image.src='assets/bg-'+({hell:'hell-muted-v40','pumpkin-patch':'pumpkin-patch-v5','sandy-dunes':'sandy-dunes-v5','corn-maze':'corn-maze-v5',graveyard:'graveyard-v5','gnome-hollow':'gnome-hollow-v5','ember-river':'ember-river-v5',space:'space-ink-v29',underwater:'underwater-ink-v29',steampunk:'steampunk-v2',wonderland:'wonderland-v2','haunted-house':'haunted-house-v2',factory:'factory-v2'}[name]||name)+'.webp';});}
async function prepareScene(scene){await Promise.all([...new Set(scene.items.map(item=>byId[item.id]?.sheet))].map(key=>sheetLoads.get(key)));if(scene.items.some(item=>!sprites.has(item.id)))throw Error('This creation uses newer illustrations. Refresh to load them.');await loadBackground(scene.background);return makePicture(scene);}
async function chooseBiome(name){if(busy)return;setBusy(true,'Waking the grove...');try{const next={...snapshot(),background:name},prepared=await prepareScene(next);remember();state=next;render(prepared);}catch(e){notify(e.message,'error');$('#biomeChoice').value=state.background;syncBiomePicker();}finally{setBusy(false);}}
function undo(){if(busy||!undoStack.length)return;redoStack.push(snapshot());state=undoStack.pop();activeUid=null;render();}
function redo(){if(busy||!redoStack.length)return;undoStack.push(snapshot());state=redoStack.pop();activeUid=null;render();}
function resizeActive(size,keepUndo=true){const item=activeOddity();if(!item||busy)return;size=Math.max(40,Math.min(MAX_SIZE,size));if(item.size===size)return;if(keepUndo)remember();const center=oddityCenter(item);item.size=size;item.y=Math.max(-MAX_SIZE,Math.min(H+MAX_SIZE,center.y+dimensions(item).h/2));render();}
function makePicture(scene=state){const out=document.createElement('canvas');out.width=W;out.height=H;draw(out.getContext('2d'),scene,animationTime,true);return out;}
function makeThumbnail(scene){const picture=makePicture(scene),out=document.createElement('canvas');out.width=480;out.height=432;out.getContext('2d').drawImage(picture,0,0,480,432);return out.toDataURL('image/webp',.82);}
function pictureBlob(){return new Promise((resolve,reject)=>makePicture().toBlob(blob=>blob?resolve(blob):reject(Error('The picture could not be created.')),'image/png'));}
function pictureFilename(biome,extension,date=new Date()){
 const slug=biome==='none'?'blank':/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(biome)&&typeof biome==='string'?biome:'blank';
 const stamp=[String(date.getFullYear()).padStart(4,'0'),...[date.getMonth()+1,date.getDate()].map(value=>String(value).padStart(2,'0'))].join('-');
 return 'whimsy-grove-'+slug+'-'+stamp+'.'+extension;
}
function downloadBlob(blob,filename,userGesture=false){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();if(userGesture)noteProgress('download');setTimeout(()=>URL.revokeObjectURL(url),60000);}
let exportController=null,exportAction='download',preparedShare=null,sharingFile=false;
function openExportPicker(action){
 if(busy||!ready||exportController||sharingFile)return;
 exportAction=action;preparedShare=null;$('#downloadTitle').textContent=action==='share'?'Share Grove':'Download Grove';
 $('#downloadChoices').hidden=false;$('#downloadProgress').hidden=true;$('#shareReady').hidden=true;$('#exportProgress').hidden=true;
 showDialog($('#downloadDialog'));$('#downloadPng').focus({preventScroll:true});
}
function savePicture(){openExportPicker('download');}
function sharePicture(){openExportPicker('share');}
async function prepareExportBlob(format,scene,controller){
 if(format==='gif'){
  const {encodeGif}=await import('./export-gif.js?v=storm');
  return encodeGif((target,time)=>draw(target,scene,time,false,true,true),{
   durationMs:scene.weather.includes('thunderstorm')?(scene.weather.includes('breeze')?36000:12000):scene.weather.includes('breeze')?9000:scene.weather.includes('wind')?6000:3000,
   signal:controller.signal,onProgress:value=>{$('#exportProgress').value=value;$('#exportStatus').textContent='Making GIF: '+Math.round(value*100)+'%';}
  });
 }
 return new Promise((resolve,reject)=>makePicture(scene).toBlob(value=>value?resolve(value):reject(Error('The picture could not be created.')),'image/png'));
}
async function exportPicture(format,event){
 if(exportController||busy||!ready)return;
 const action=exportAction,controller=new AbortController();exportController=controller;
 let downloadFinished=false;
 const scene=snapshot(),filename=pictureFilename(scene.background,format),dialog=$('#downloadDialog');$('#downloadChoices').hidden=true;$('#downloadProgress').hidden=false;
 $('#downloadProgress .status-spinner').hidden=false;$('#exportFinishedIcon').toggleAttribute('hidden',true);$('#exportProgress').value=0;$('#exportProgress').hidden=false;$('#exportStatus').textContent=format==='gif'?'Preparing animated GIF…':'Preparing PNG…';
 setBusy(true,action==='share'?'Preparing to share':'Preparing download');$('#busyOverlay').hidden=true;$('#downloadCancel').focus({preventScroll:true});
 try{
  const blob=await prepareExportBlob(format,scene,controller);
  if(controller.signal.aborted||!dialog.open)return;
  if(action==='share'){
   $('#exportProgress').value=1;
   const file=new File([blob],filename,{type:format==='gif'?'image/gif':'image/png'});
   let canShare=false;
   try{canShare=!!(navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
   preparedShare={file,blob,format,canShare};
   // Use the original click when the encoder finished before activation expired.
   if(canShare&&event?.isTrusted&&navigator.userActivation?.isActive){
    await openNativeShare(event,true);
   }
  }else{
   downloadBlob(blob,filename,!!event?.isTrusted);showDownloadComplete();downloadFinished=true;
  }
 }catch(error){
  if(error.name!=='AbortError')notify(error.message||'The file could not be prepared. Try PNG instead.','error');
 }finally{
  if(exportController===controller)exportController=null;
  setBusy(false);
  if(dialog.open&&preparedShare&&!controller.signal.aborted){
   showPreparedShare();
  }else if(dialog.open&&!downloadFinished)dialog.close();
 }
}
function showDownloadComplete(){
 $('#shareReady').hidden=true;$('#downloadProgress').hidden=false;
 $('#downloadProgress .status-spinner').hidden=true;$('#exportFinishedIcon').toggleAttribute('hidden',false);$('#exportProgress').value=1;
 $('#exportStatus').textContent='Download started.';
 $('#downloadCancel').focus({preventScroll:true});
}
function showPreparedShare(){
 if(!preparedShare)return;
 const {format,canShare,message}=preparedShare,kind=format.toUpperCase(),button=$('#sharePrepared');
 $('#downloadProgress').hidden=true;$('#shareReady').hidden=false;button.hidden=false;
 $('#shareReadyText').textContent=message||(canShare?'':'This browser can’t share '+kind+' files directly. Download it to share from your device.');
 button.textContent=canShare?'Open device share menu':'Download '+kind;button.focus({preventScroll:true});
}
async function openNativeShare(event,fromChoice=false){
 const entry=preparedShare,dialog=$('#downloadDialog');if(!entry||sharingFile)return;
 sharingFile=true;
 $('#downloadProgress').hidden=true;$('#shareReady').hidden=false;$('#sharePrepared').hidden=true;
 $('#exportStatus').textContent='';$('#shareReadyText').textContent='Choose where to share.';
 $('#downloadCancel').focus({preventScroll:true});
 try{
  await navigator.share({files:[entry.file],title:'Whimsy Grove'});
  if(event?.isTrusted)noteProgress('share');
  if(dialog.open&&preparedShare===entry)dialog.close();
 }catch(error){
  if(!dialog.open||preparedShare!==entry||error.name==='AbortError')return;
  // An activation or policy error can still succeed from the explicit button.
  if(fromChoice&&error.name==='NotAllowedError')return;
  entry.canShare=false;
  entry.message='The share menu couldn’t open. Download this '+entry.format.toUpperCase()+' to share it from your device.';
 }finally{sharingFile=false;}
}
async function sharePreparedFile(event){
 if(!preparedShare||sharingFile)return;
 const {blob,file,canShare}=preparedShare,dialog=$('#downloadDialog');
 if(!canShare){downloadBlob(blob,file.name,!!event?.isTrusted);preparedShare=null;showDownloadComplete();return;}
 await openNativeShare(event);
 if(dialog.open)showPreparedShare();
}
$('#downloadPng').addEventListener('click',event=>exportPicture('png',event));
$('#downloadGif').addEventListener('click',event=>exportPicture('gif',event));
$('#sharePrepared').addEventListener('click',sharePreparedFile);
$('#downloadCancel').addEventListener('click',()=>{$('#downloadDialog').returnValue='cancel';$('#downloadDialog').close();});
$('#downloadDialog').addEventListener('close',()=>{if(!$('#downloadDialog').open){exportController?.abort();preparedShare=null;}});
const browserStorage=import('./browser-storage.js');
async function request(path,options={}){return (await browserStorage).request(path,options);}
const activityStates=new Map();
function showActivity(key,label){activityStates.set(key,label);syncFeedback();}
function hideActivity(key){activityStates.delete(key);syncFeedback();}
function refreshAccountGates(){$('#accountSignIn').hidden=true;if(ready)updateControls();}
function requireAccount(){if(accountReady)return true;notify('Browser storage is not ready. It may be full or blocked.','error');return false;}
async function checkAccount(){showActivity('account','Opening browser storage…');try{const data=await request('/api/session');signedIn=!!data.signedIn;const nextScope=data.draftScope||null;if(draftScope!==nextScope&&draftEnabled)draftEnabled=false;draftScope=nextScope;accountReady=signedIn&&!!data.storageReady;accountChecked=true;$('#accountStatus').textContent=signedIn&&!accountReady?'Browser storage is temporarily unavailable':'';$('#accountStatus').hidden=!signedIn||accountReady;if(accountReady)await loadFavorites();else if(!signedIn){favorites=new Set();renderOddities();}}catch{signedIn=false;draftScope=null;accountChecked=true;accountReady=false;favorites=new Set();$('#accountStatus').hidden=false;$('#accountStatus').textContent='Browser storage needs attention';renderOddities();}finally{hideActivity('account');refreshAccountGates();syncAchievements();}}
$('#openHelp').addEventListener('click',()=>{closeFloating('user');showDialog($('#helpDialog'),$('#userMenuButton'));$('#closeHelp').focus({preventScroll:true});});
$('#closeHelp').addEventListener('click',()=>$('#helpDialog').close());
$('#helpDialog').addEventListener('close',()=>$('#userMenuButton').focus({preventScroll:true}));
$('#accountSignIn').addEventListener('click',()=>{closeFloating('user');requireAccount('save your creations and favorites');});
async function restoreSignInDraft(){return false;}
function validDraftScene(scene){return !!scene&&(scene.motionPreference===undefined||scene.motionPreference==='auto'||typeof scene.motionPreference==='boolean')&&(scene.albumSourceId===undefined||typeof scene.albumSourceId==='string'&&/^[0-9a-f-]{36}$/i.test(scene.albumSourceId))&&(scene.motion===undefined||typeof scene.motion==='boolean')&&(scene.creationId===undefined||typeof scene.creationId==='string'&&/^[0-9a-f-]{36}$/i.test(scene.creationId))&&(scene.promptId===undefined||scene.promptId===null||!!ideaById[scene.promptId])&&(scene.promptHidden===undefined||typeof scene.promptHidden==='boolean')&&scene.version===2&&Array.isArray(scene.items)&&scene.items.length<=100&&scene.items.every(x=>byId[x.id]&&typeof x.uid==='string'&&Number.isFinite(x.x)&&x.x>=-3600&&x.x<=4800&&Number.isFinite(x.y)&&x.y>=-3600&&x.y<=4680&&Number.isFinite(x.size)&&x.size>=35&&x.size<=3600&&typeof x.flip==='boolean'&&(x.rotation===undefined||(Number.isFinite(x.rotation)&&Math.abs(x.rotation)<=180)))&&!!colorOptions[scene.palette]&&biomeNames.includes(scene.background)&&Array.isArray(scene.weather)&&scene.weather.every(x=>['rain','drizzle','heavy-rain','thunderstorm','snow','flurries','fog','mist','mist-wisps','smoke','smog','breeze','wind','gusts','blizzard','lightning'].includes(x));}
function currentDraftKey(){return signedIn&&draftScope?'spooky-grove-current-'+draftScope:signedIn===false?'spooky-grove-current-guest':null;}
function localDraft(){const key=currentDraftKey();if(!key)return null;try{const value=JSON.parse(localStorage.getItem(key)||'null');return value&&validDraftScene(value.scene)&&typeof value.editId==='string'?value:null;}catch{return null;}}
function keepLocalDraft(value){const key=currentDraftKey();if(!key)return false;try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
const draftSaveWarning='Your grove couldn’t be saved. Download it before leaving this page.';
let draftSaveWarningShown=false;
function setDraftSaveWarning(unsaved){
 if(unsaved){
  if(!draftSaveWarningShown){draftSaveWarningShown=true;notify(draftSaveWarning,'error');}
 }else if(draftSaveWarningShown){
  draftSaveWarningShown=false;
  if(pendingToast?.text===draftSaveWarning)pendingToast=null;
  if($('#toast').firstChild?.textContent===draftSaveWarning)dismissToast();
 }
}
function freshScene(){const scene=blankScene(),worlds=biomeNames.filter(x=>x!=='none');scene.background=worlds[Math.floor(Math.random()*worlds.length)];return scene;}
function onboardingKey(){return'whimsy-grove-onboarding-complete:'+new URL('.',location.href).pathname;}
function onboardingComplete(){try{return localStorage.getItem(onboardingKey())==='1';}catch{return false;}}
function markOnboardingComplete(){try{localStorage.setItem(onboardingKey(),'1');}catch{}}
function firstOddityGuideKey(){return'whimsy-grove-first-oddity-guide:'+new URL('.',location.href).pathname;}
let firstOddityGuide=null;
try{firstOddityGuide=JSON.parse(localStorage.getItem(firstOddityGuideKey())||'null');}catch{}
function rememberFirstOddityGuide(){try{localStorage.setItem(firstOddityGuideKey(),JSON.stringify(firstOddityGuide));}catch{}}
function armFirstOddityGuide(){
 if(firstOddityGuide)return;
 firstOddityGuide={creationId:state.creationId,wiggled:false,dismissed:false};rememberFirstOddityGuide();
}
function syncFirstOddityGuide(){
 const hint=$('#firstOddityGuide'),plus=$('#toggleOddities'),guide=firstOddityGuide;
 const show=!!guide&&!guide.dismissed&&guide.creationId===state.creationId&&!state.items.length&&ready&&!busy&&usesOddityModal();
 hint.hidden=!show;
 if(show)plus.setAttribute('aria-describedby','firstOddityGuide');
 else plus.removeAttribute('aria-describedby');
 if(!show||!motionEnabled()||reducedMotion)plus.classList.remove('first-oddity-wiggle');
 if(!show)return;
 if(!guide.wiggled){
  guide.wiggled=true;rememberFirstOddityGuide();
  if(motionEnabled()&&!reducedMotion)plus.classList.add('first-oddity-wiggle');
 }
}
function dismissFirstOddityGuide(){
 if(!firstOddityGuide||firstOddityGuide.dismissed||firstOddityGuide.creationId!==state.creationId)return;
 firstOddityGuide.dismissed=true;rememberFirstOddityGuide();syncFirstOddityGuide();
}
document.addEventListener('grove-oddities-open',dismissFirstOddityGuide);
function sceneNeedsOnboarding(scene){return !scene||scene.items.length===0&&!scene.promptId;}

async function restoreCurrentDraft(fromSignIn=false){
  if(!accountChecked||signedIn===null)throw Error('Browser storage could not be opened. Refresh to restore your creation.');
  const local=localDraft();
  let remote=null;
  draftCloudReady=false;
  if(signedIn){
    try{
      const result=await request('/api/draft');
      if(result.scope!==draftScope)throw Error('Browser storage changed. Refresh to restore your creation.');
      if(result.draft&&!validDraftScene(result.draft.scene))throw Error('Your saved creation could not be read.');
      remote=result.draft;
      draftCloudReady=true;
    }catch(error){
      if(!local&&!fromSignIn)throw error;
    }
  }
  const pendingLocal=local?.pending;
  const chosen=fromSignIn?{scene:snapshot(),editId:uid(),updatedAt:Date.now(),pending:true}:pendingLocal?local:remote||local;
  const fresh=!chosen,migrated=!!chosen&&!chosen.scene.creationId;
  let firstGrove=!fromSignIn&&!onboardingComplete()&&sceneNeedsOnboarding(chosen?.scene);
  if(firstGrove){
    try{
      const history=await request('/api/drawings?collection=history&sort=newest&offset=0');
      firstGrove=!history.items?.length;
    }catch{
      firstGrove=sceneNeedsOnboarding(chosen?.scene);
    }
  }
  if(chosen){
    await loadBackground(chosen.scene.background);
    state=clone(chosen.scene);
    if(!state.creationId)state.creationId=chosen.editId||uid();
  }else{
    state=freshScene();
    await loadBackground(state.background);
  }
  selected=null;activeUid=null;undoStack=[];redoStack=[];
  draftSignature=JSON.stringify(state);
  draftPending=firstGrove?null:chosen?.pending||migrated?
    {...chosen,editId:migrated?uid():chosen.editId,updatedAt:migrated?Date.now():chosen.updatedAt,scene:snapshot(),pending:true,scope:draftScope}:
    fresh?{scene:snapshot(),editId:uid(),updatedAt:Date.now(),pending:true,scope:draftScope}:null;
  if(!firstGrove){
    const kept=keepLocalDraft(draftPending||{scene:snapshot(),editId:chosen.editId,updatedAt:chosen.updatedAt,pending:false});
    if(draftPending&&!kept&&!(signedIn&&draftCloudReady))setDraftSaveWarning(true);
    if(fresh&&signedIn&&draftCloudReady){
      const saved=await saveDraftRecord(draftPending,true);
      if(saved){await loadBackground(saved.scene.background);state=clone(saved.scene);draftSignature=JSON.stringify(state);}
    }
  }
  draftEnabled=true;
  if(draftPending)queueDraft(true);
  if(!firstGrove&&!onboardingComplete())markOnboardingComplete();
  return firstGrove;
}
function queueDraft(force=false){if(!draftEnabled||!ready)return;const signature=JSON.stringify(state);if(signature!==draftSignature){draftSignature=signature;draftPending={scene:snapshot(),editId:uid(),updatedAt:Date.now(),pending:true,scope:draftScope};const kept=keepLocalDraft(draftPending);if(kept)setDraftSaveWarning(false);else if(!(signedIn&&draftCloudReady))setDraftSaveWarning(true);}if(!draftPending&&!force)return;if(draftTimer)clearTimeout(draftTimer);if(signedIn&&draftCloudReady)draftTimer=setTimeout(()=>flushDraft(),450);}
async function saveDraftRecord(record,initialize=false,keepalive=false){if(!record||!signedIn||!draftCloudReady||record.scope!==draftScope)return null;try{const result=await request('/api/draft',{method:'PUT',keepalive,body:JSON.stringify({scope:record.scope,editId:record.editId,scene:record.scene,initialize})});if(!result.saved||result.scope!==record.scope||!validDraftScene(result.draft?.scene))throw Error('The current creation save was not confirmed.');if(draftPending?.editId===record.editId){draftPending=null;if(!keepLocalDraft({...result.draft,pending:false})){try{localStorage.removeItem(currentDraftKey());}catch{}}setDraftSaveWarning(false);}return result.draft;}catch(error){console.error('Draft save failed',error);if(draftPending?.editId===record.editId&&record.scope===draftScope)setDraftSaveWarning(localDraft()?.editId!==record.editId);return null;}}
async function flushDraft(keepalive=false){if(draftTimer)clearTimeout(draftTimer);draftTimer=null;if(draftInFlight||!draftEnabled||!draftPending||!signedIn||!draftCloudReady)return;const record=draftPending;draftInFlight=true;try{await saveDraftRecord(record,false,keepalive);}finally{draftInFlight=false;if(draftPending&&draftPending.editId!==record.editId)draftTimer=setTimeout(()=>flushDraft(),250);}}
window.addEventListener('pagehide',()=>{queueDraft();flushDraft(true);});
window.addEventListener('focus',()=>{if(draftEnabled&&draftPending&&draftCloudReady)flushDraft();});
const themeIcons={'light': '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>', 'dark': '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.7 13.2A9 9 0 0 1 10.8 3.3 9 9 0 1 0 20.7 13.2Z"/></svg>'};
function updateThemeButton(){const dark=document.documentElement.dataset.theme!=='light';document.querySelector('meta[name=theme-color]')?.setAttribute('content',dark?'#23192b':'#f3ece1');const label=dark?'Switch to Light Mode':'Switch to Dark Mode';$('#themeToggle').innerHTML=themeIcons[dark?'light':'dark']+'<span>'+(dark?'Light Mode':'Dark Mode')+'</span>';$('#themeToggle').setAttribute('aria-label',label);$('#themeToggle').title=label;}
$('#themeToggle').addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('spooky-grove-theme',document.documentElement.dataset.theme);}catch{}updateThemeButton();closeFloating('user',true);});updateThemeButton();
async function persistScene(collectionName,scene,reason='Creation',title=null){const signature=collectionName+JSON.stringify(scene)+JSON.stringify(title);if(!pendingSave||pendingSave.signature!==signature)pendingSave={signature,id:uid()};const result=await request('/api/drawings',{method:'POST',body:JSON.stringify({id:pendingSave.id,collection:collectionName,scene,title,thumbnail:makeThumbnail(scene)})});if(collectionName==='album'&&result.titleTaken){pendingSave=null;return result;}if(collectionName==='album'&&result.duplicate){pendingSave=null;return null;}if(!result.saved)throw Error('The save was not confirmed. Your creation is unchanged.');pendingSave=null;accountReady=true;signedIn=true;accountChecked=true;refreshAccountGates();return result.drawing;}
function confirmation(kind){return new Promise(resolve=>{const dialog=$('#confirmDialog'),newGrove=kind!=='restore'&&kind!=='randomize';$('#confirmNewMushroom').hidden=!newGrove;$('#confirmOtherSymbol').hidden=newGrove;$('#confirmTitle').textContent=kind==='randomize'?'Let a new grove take root?':kind==='restore'?'Open this grove?':'Let this grove become a memory?';$('#confirmText').textContent=kind==='restore'?'Your current creation will be saved in History before this creation opens.':'This will clear your creation, but you will be able to access it in your history.';$('#confirmAction').textContent=kind==='randomize'?'Save and Randomize':kind==='restore'?'Save and Open':'Start Over';dialog.returnValue='cancel';dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});showDialog(dialog);});}
function randomizedScene(){const s=blankScene(),r=rand(Date.now()%1000000);s.seed=Math.floor(r()*1000000);s.palette=Object.keys(colorOptions)[Math.floor(r()*Object.keys(colorOptions).length)];s.background=biomeNames[1+Math.floor(r()*(biomeNames.length-1))];for(let i=0;i<18;i++){const available=oddityCatalog.filter(x=>!x.hidden),choice=available[Math.floor(r()*available.length)];const item=makeOddity(choice.id,(.12+r()*.76)*W,(.28+r()*.66)*H,choice.size*(.75+r()*.35));item.flip=r()<.25;item.order=i;s.items.push(item);}return s;}
async function replaceScene(kind,replacement=null){if(busy||!ready)return;if(!requireAccount('save a memory before replacing your creation'))return;if(kind!=='restore'&&!await confirmation(kind))return;setBusy(true,kind==='restore'?'Waking the grove...':kind==='randomize'?'Randomizing grove':'Starting grove');const previous=snapshot();try{await persistScene('history',previous,kind==='clear'?'Before clearing':kind==='randomize'?'Before randomizing':'Before restoring');const next=kind==='clear'?(replacement?clone(replacement):blankScene()):kind==='randomize'?randomizedScene():clone(replacement);const prepared=await prepareScene(next);remember();state=next;selected=null;activeUid=null;mode='move';renderOddities();render(prepared);}catch(e){notify(e.message+' Your creation is unchanged.','error');}finally{setBusy(false);}}
const albumNameTakenMessage='That name is already in your Album. Choose a different name.';
async function albumNameSuggestion(query){
  return (await request('/api/album-name?'+new URLSearchParams(query))).title;
}
const duplicateAlbumMessage='This creation is already saved in your Album.';
async function saveToAlbum(){
  if(busy||!ready||$('#renameDialog').open)return;
  if(!requireAccount('save creations to your Album'))return;
  const scene=snapshot();
  try{
    const suggestion=await albumNameSuggestion({biome:scene.background});
    if(busy)return;
    let saved;
    const title=await namePrompt(suggestion,true,'',async title=>{
      saved=await persistScene('album',scene,'Whimsy Grove',title);
      return saved?.titleTaken?albumNameTakenMessage:!saved?duplicateAlbumMessage:'';
    });
    if(title===null)return;
    state.albumSourceId=saved.id;queueDraft();window.groveAudio?.effect('save');syncAchievements();
  }catch(e){notify(e.message,'error');}
}
async function addHistoryToAlbum(item,add){
  add.disabled=true;
  try{
    const suggestion=await albumNameSuggestion({historyId:item.id});
    const title=await namePrompt(suggestion,true,'',async title=>{
      const result=await request('/api/drawings/'+item.id+'/album',{method:'POST',body:JSON.stringify({title})});
      if(result.titleTaken)return albumNameTakenMessage;
      if(result.duplicate)return duplicateAlbumMessage;
      if(!result.saved)throw Error('The save was not confirmed.');
      return '';
    });
    if(title===null)return;
    item.inAlbum=true;add.textContent='In Album';window.groveAudio?.effect('save');syncAchievements();
  }catch(e){notify(e.message,'error');}
  finally{add.disabled=item.inAlbum;if(!item.inAlbum)add.textContent='Add to Album';}
}
function syncAlbumOptions(){const wrap=$('#albumOptionsWrap');wrap.hidden=collection!=='album';document.dispatchEvent(new Event('grove-album-options-close'));$('#backupStatus').hidden=true;$('#backupStatus').textContent='';}
async function openAlbumHistory(kind,append=false,options={}){if(busy)return;closeSavedMenu();if(!requireAccount('open your '+(kind==='album'?'Album':'History')))return;const previousCollection=collection;if(kind!==collection)albumSort=albumHistorySorts[kind];collection=kind;syncAlbumOptions();$('#albumSortControl').hidden=false;syncAlbumSort();const generation=++albumHistoryGeneration;$('#albumHistoryTitle').textContent='Groves';document.querySelectorAll('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gallery===kind)));const grid=$('#savedGroveGrid'),dialog=$('#albumHistoryDialog'),preserveLayout=!append&&dialog.open,scroller=$('#galleryContent'),previousScroll=scroller.scrollTop;if(preserveLayout){grid.style.minHeight=grid.getBoundingClientRect().height+'px';grid.setAttribute('aria-busy','true');grid.classList.add('gallery-refreshing');for(const button of grid.querySelectorAll?.('button')||[]){if(button.dataset.albumHistoryWasDisabled===undefined)button.dataset.albumHistoryWasDisabled=String(button.disabled);button.disabled=true;}/* Keep the sort trigger stable; the gallery grid announces loading. */}else if(!append){grid.style.minHeight='';grid.setAttribute('aria-busy','false');grid.classList.remove('gallery-refreshing');for(const button of grid.querySelectorAll?.('button')||[]){if(button.dataset.albumHistoryWasDisabled!==undefined){button.disabled=button.dataset.albumHistoryWasDisabled==='true';delete button.dataset.albumHistoryWasDisabled;}}$('#albumSortButton').classList.remove('is-loading');grid.replaceChildren();nextOffset=null;}if(!$('#albumHistoryDialog').open)showDialog($('#albumHistoryDialog'),kind==='album'?$('#openAlbum'):$('#userMenuButton'));$('#loadMore').hidden=true;const loading=document.createElement('p');loading.className='gallery-empty';loading.setAttribute('role','status');loading.setAttribute('aria-live','polite');loading.classList.add('is-loading');loading.textContent='Loading '+(kind==='album'?'Album':'History')+'…';if(!append&&!preserveLayout)grid.append(loading);try{const data=await request('/api/drawings?collection='+kind+'&sort='+albumSort+'&offset='+(append?nextOffset||0:0));if(generation!==albumHistoryGeneration)return;albumHistoryRenderedSort=albumSort;loading.remove();if(preserveLayout){closeSavedMenu();grid.replaceChildren();nextOffset=null;}for(const item of data.items){const card=document.createElement('article');card.className='saved-card';const image=document.createElement('img');image.src=item.thumbnail;image.alt='';image.loading='lazy';const thumbnail=document.createElement('figure');thumbnail.className='saved-thumbnail';thumbnail.append(image);const body=document.createElement('div'),title=document.createElement('h3'),date=document.createElement('p'),buttons=document.createElement('div');title.textContent=item.title;title.title=item.title;date.className='saved-date';const datePart=document.createElement('span'),timePart=document.createElement('span');datePart.textContent=new Date(item.createdAt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})+' ';timePart.textContent=new Date(item.createdAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});datePart.className='saved-day';timePart.className='saved-clock';date.append(datePart,timePart);buttons.className='saved-actions';const restore=document.createElement('button');restore.textContent='Open';restore.addEventListener('click',()=>openSavedCreation(item,restore));buttons.append(restore);if(kind==='history'){const add=document.createElement('button');add.textContent=item.inAlbum?'In Album':'Add to Album';add.disabled=item.inAlbum;add.addEventListener('click',()=>addHistoryToAlbum(item,add));buttons.append(add);}addSavedGroveActions(buttons,item,kind,card);body.append(title,date);mountSavedMenu(card,body,buttons,item);card.prepend(thumbnail);card.append(body);grid.append(card);}nextOffset=data.nextOffset;$('#loadMore').hidden=nextOffset===null;if(!grid.children.length){const p=document.createElement('p');p.className='gallery-empty';p.textContent=kind==='album'?'Album is empty.':'History is empty.';grid.append(p);}}catch(e){if(generation!==albumHistoryGeneration)return;if(preserveLayout){collection=previousCollection;syncAlbumOptions();albumSort=options.previousSort||albumHistorySorts[previousCollection];albumHistorySorts[previousCollection]=albumSort;$('#albumHistoryTitle').textContent=collection==='album'?'Album':'History';document.querySelectorAll('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gallery===collection)));syncAlbumSort();notify(e.message,'error');}else{loading.classList.remove('is-loading');loading.textContent=e.message;if(append)grid.append(loading);}}finally{if(generation===albumHistoryGeneration){grid.setAttribute('aria-busy','false');grid.classList.remove('gallery-refreshing');for(const button of grid.querySelectorAll?.('button')||[]){if(button.dataset.albumHistoryWasDisabled!==undefined){button.disabled=button.dataset.albumHistoryWasDisabled==='true';delete button.dataset.albumHistoryWasDisabled;}}$('#albumSortButton').classList.remove('is-loading');if(preserveLayout){scroller.scrollTop=previousScroll;requestAnimationFrame(()=>{if(generation===albumHistoryGeneration){grid.style.minHeight='';scroller.scrollTop=previousScroll;}});}}}}
async function openSavedCreation(item,button){if(busy||albumHistoryOpening)return;albumHistoryOpening=true;button.disabled=true;button.setAttribute('aria-busy','true');const status=$('#albumHistoryStatus');status.hidden=false;status.classList.add('is-loading');status.textContent='Waking the grove...';setBusy(true,'Waking the grove...');$('#busyOverlay').hidden=true;try{const result=await request('/api/drawings/'+item.id);$('#albumHistoryStatus').hidden=true;$('#albumHistoryDialog').close();setBusy(false);await replaceScene('restore',{...result.drawing.scene,creationId:result.drawing.scene.creationId||item.id,...(result.drawing.inAlbum?{albumSourceId:item.id}:{})});}catch(e){notify(e.message,'error');}finally{status.hidden=true;status.classList.remove('is-loading');albumHistoryOpening=false;setBusy(false);button.disabled=false;button.setAttribute('aria-busy','false');}}
$('#cancelRename').addEventListener('click',()=>{$('#renameDialog').returnValue='cancel';$('#renameDialog').close();});
const nameSegments=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
const nameCharacters=value=>nameSegments?Array.from(nameSegments.segment(value),part=>part.segment):Array.from(value);
const clipName=value=>nameCharacters(value).slice(0,15).join('');
let nameComposing=false;
function hardLimitName(){const input=$('#renameInput');if(nameComposing)return;const start=input.selectionStart??input.value.length,end=input.selectionEnd??start,next=clipName(input.value);if(next!==input.value){input.value=next;input.setSelectionRange?.(Math.min(start,next.length),Math.min(end,next.length));}input.setCustomValidity('');}
function insertNameText(text){const input=$('#renameInput'),start=input.selectionStart??input.value.length,end=input.selectionEnd??start,prefix=input.value.slice(0,start),suffix=input.value.slice(end),available=Math.max(0,15-nameCharacters(prefix+suffix).length),added=nameCharacters(text).slice(0,available).join(''),next=clipName(prefix+added+suffix);input.value=next;const caret=Math.min(next.length,prefix.length+added.length);input.setSelectionRange?.(caret,caret);input.setCustomValidity('');}
async function presentMutationSuccess(status,message){
  status.hidden=false;status.textContent=message;status.focus({preventScroll:true});
  await new Promise(resolve=>setTimeout(resolve,1250));
}
function namePrompt(title,adding=false,feedback='',submitName=null){
  const dialog=$('#renameDialog');
  if(dialog.open)return Promise.resolve(null);
  dialog.toggleAttribute('data-adding',adding);
  return new Promise(resolve=>{
    const form=$('#renameDialog form'),input=$('#renameInput'),confirm=$('#nameConfirm'),cancel=$('#cancelRename'),error=$('#nameError'),success=$('#nameSuccess');
    const showError=message=>{error.hidden=!message;error.textContent=message;};
    const actionLabel=adding?'Save to Album':'Save Name';
    let saving=false;
    const preventBusyCancel=event=>{if(saving)event.preventDefault();};
    const submit=async event=>{
      if(event.defaultPrevented)return;
      event.preventDefault();
      if(saving)return;
      saving=true;confirm.disabled=true;cancel.disabled=true;input.readOnly=true;confirm.textContent='Saving…';
      showError('');
      try{
        const problem=await submitName(input.value.trim());
        if(problem){showError(problem);input.focus();return;}
        await presentMutationSuccess(success,adding?'Added to Album':'Creation renamed.');
        dialog.close('confirm');
      }catch(e){showError(e.message||'The save was not confirmed.');input.focus();}
      finally{saving=false;confirm.disabled=false;cancel.disabled=false;input.readOnly=false;confirm.textContent=actionLabel;success.hidden=true;success.textContent='';}
    };
    nameComposing=false;
    showError(feedback);
    $('#renameTitle').textContent=adding?'Name Grove':'Rename This Creation';
    confirm.textContent=actionLabel;
    input.value=adding?clipName(title):title;
    input.setCustomValidity('');
    input.placeholder=adding?'Automatic Name if Blank':'';
    dialog.returnValue='cancel';
    if(submitName){form.addEventListener('submit',submit);dialog.addEventListener('cancel',preventBusyCancel);}
    dialog.addEventListener('close',()=>{
      form.removeEventListener('submit',submit);dialog.removeEventListener('cancel',preventBusyCancel);
      resolve(dialog.returnValue==='confirm'?input.value.trim():null);
    },{once:true});
    showDialog(dialog);input.focus();input.setSelectionRange(input.value.length,input.value.length);
  });
}
$('#renameInput').addEventListener('beforeinput',e=>{if(nameComposing||e.isComposing||!e.inputType?.startsWith('insert')||e.data==null)return;const input=$('#renameInput'),start=input.selectionStart??input.value.length,end=input.selectionEnd??start,next=input.value.slice(0,start)+e.data+input.value.slice(end);if(nameCharacters(next).length>15){e.preventDefault();insertNameText(e.data);}});
$('#renameInput').addEventListener('paste',e=>{const text=e.clipboardData?.getData('text/plain');if(text===undefined)return;e.preventDefault();insertNameText(text);});
$('#renameInput').addEventListener('compositionstart',()=>{nameComposing=true;});
$('#renameInput').addEventListener('compositionend',()=>{nameComposing=false;hardLimitName();});
$('#renameInput').addEventListener('input',e=>{if(!e.isComposing)hardLimitName();});
$('#renameDialog form').addEventListener('submit',e=>{if(nameComposing||nameCharacters($('#renameInput').value.trim().replace(/\s+/g,' ')).length>15){e.preventDefault();$('#renameInput').setCustomValidity('Use 15 characters or fewer.');$('#renameInput').reportValidity();}});
async function renameAlbumGrove(item,rename){
  rename.disabled=true;
  let renamed=false;
  try{
    await namePrompt(item.title,false,'',async title=>{
      if(title===item.title)return 'Enter a different name to rename this creation.';
      if(!title)return 'Give this grove a name.';
      const result=await request('/api/drawings/'+item.id,{method:'PATCH',body:JSON.stringify({title})});
      if(result.titleTaken)return albumNameTakenMessage;
      if(!result.saved)throw Error('The new name was not confirmed.');
      renamed=true;return '';
    });
    if(renamed)await openAlbumHistory('album');
  }catch(e){notify(e.message,'error');}
  finally{rename.disabled=false;}
}
function deletePrompt(item,kind){
  const dialog=$('#deleteDialog');
  if(dialog.open)return Promise.resolve(null);
  return new Promise(resolve=>{
    const form=$('#deleteDialog form'),cancel=$('#cancelDelete'),action=$('#deleteAction'),error=$('#deleteError'),success=$('#deleteSuccess');
    const places=item.inAlbum&&item.inHistory?'Album and History':item.inAlbum?'Album':'History';
    let deleting=false;
    const preventBusyCancel=event=>{if(deleting)event.preventDefault();};
    const submit=async event=>{
      if(event.submitter!==action)return;
      event.preventDefault();
      if(deleting)return;
      deleting=true;action.disabled=true;cancel.disabled=true;
      error.hidden=true;error.textContent='';action.textContent='Deleting…';
      try{
        const result=await request('/api/drawings/'+item.id,{method:'DELETE',body:JSON.stringify({confirmation:'permanently-delete',collection:kind,title:item.title})});
        if(!result.deleted)throw Error('The deletion was not confirmed. Reopen your saved creations to check.');
        await presentMutationSuccess(success,result.cleanupPending?'Creation deleted. Image cleanup could not be confirmed.':'Creation permanently deleted.');
        dialog.close('confirm');
      }catch(e){
        error.textContent=e.status?e.message:'The deletion could not be confirmed. Reopen Album or History to check.';
        error.hidden=false;
      }finally{deleting=false;action.disabled=false;cancel.disabled=false;action.textContent='Permanently delete';success.hidden=true;success.textContent='';if(dialog.open)cancel.focus();}
    };
    $('#deleteText').textContent='“'+item.title+'” will be permanently deleted from '+places+'. This cannot be undone.';
    error.hidden=true;error.textContent='';dialog.returnValue='cancel';
    form.addEventListener('submit',submit);dialog.addEventListener('cancel',preventBusyCancel);
    dialog.addEventListener('close',()=>{form.removeEventListener('submit',submit);dialog.removeEventListener('cancel',preventBusyCancel);resolve(dialog.returnValue==='confirm');},{once:true});
    showDialog(dialog);cancel.focus();
  });
}
function addSavedGroveActions(buttons,item,kind,card){
  if(kind==='album'){const rename=document.createElement('button');rename.textContent='Rename';rename.addEventListener('click',()=>renameAlbumGrove(item,rename));buttons.append(rename);}
  const remove=document.createElement('button');remove.textContent='Delete';remove.className='delete-drawing';
  remove.addEventListener('click',async()=>{if(await deletePrompt(item,kind))await openAlbumHistory(kind);});buttons.append(remove);
}
let savedMenu=null;
function closeSavedMenu(focus=false){if(!savedMenu)return;const {button,menu,cardTrigger}=savedMenu;menu.hidden=true;button.setAttribute('aria-expanded','false');cardTrigger.setAttribute('aria-expanded','false');savedMenu=null;if(focus)(isMobilePicker()?cardTrigger:button).focus({preventScroll:true});}
function popupPlacement(box,desiredWidth,desiredHeight=320,alignRight=false){const margin=12,gap=7,vw=window.innerWidth||400,vh=window.innerHeight||800,width=Math.max(1,Math.min(desiredWidth,vw-margin*2)),below=Math.max(0,vh-margin-box.bottom-gap),above=Math.max(0,box.top-gap-margin),up=below<Math.min(desiredHeight,180)&&above>below;let available=Math.min(Math.max(1,vh-margin*2),up?above:below),top=up?Math.max(margin,box.top-gap-Math.min(desiredHeight,available)):box.bottom+gap;if(available<44){available=Math.max(1,vh-margin*2);top=margin;}const maxHeight=Math.max(1,Math.min(desiredHeight,available));top=Math.max(margin,Math.min(top,vh-margin-maxHeight));return{left:Math.max(margin,Math.min(alignRight?(box.right??box.left+box.width)-width:box.left,vw-width-margin))+'px',width:width+'px',top:top+'px',bottom:'auto',maxHeight:maxHeight+'px'};}
function positionSavedMenu(){
 if(!savedMenu)return;
 const {button,menu,cardTrigger}=savedMenu,mobile=isMobilePicker(),box=(mobile?cardTrigger:button).getBoundingClientRect(),margin=8,vw=window.innerWidth||400,vh=window.innerHeight||800;
 const width=Math.min(160,vw-margin*2);
 menu.style.width=width+'px';
 const height=menu.getBoundingClientRect().height,desktopInset=10,below=mobile?box.top+8:box.bottom-desktopInset,above=box.top+desktopInset-height;
 const top=!mobile&&below+height>vh-margin&&above>=margin?above:Math.max(margin,Math.min(below,vh-margin-height));
 const left=Math.max(margin,Math.min(box.right-width-(mobile?8:desktopInset),vw-margin-width));
 Object.assign(menu.style,{left:left+'px',top:top+'px'});
}
function mountSavedMenu(card,body,menu,item){const button=document.createElement('button');button.type='button';button.className='saved-menu-trigger icon-button';button.innerHTML='<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';button.setAttribute('aria-label','Actions for '+item.title);button.title='Actions for '+item.title;button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');menu.id='actions-'+item.id;button.setAttribute('aria-controls',menu.id);menu.classList.add('saved-menu');menu.setAttribute('role','menu');menu.setAttribute('aria-label','Actions for '+item.title);menu.hidden=true;for(const action of menu.children){action.setAttribute('role','menuitem');action.addEventListener('click',()=>closeSavedMenu());}const cardTrigger=document.createElement('button');cardTrigger.type='button';cardTrigger.className='saved-card-hit-target';cardTrigger.setAttribute('aria-label','Actions for '+item.title);cardTrigger.setAttribute('aria-haspopup','menu');cardTrigger.setAttribute('aria-controls',menu.id);cardTrigger.setAttribute('aria-expanded','false');const toggleMenu=()=>{if(savedMenu?.menu===menu){closeSavedMenu(true);return;}closeSavedMenu();savedMenu={button,menu,cardTrigger};menu.hidden=false;button.setAttribute('aria-expanded','true');cardTrigger.setAttribute('aria-expanded','true');positionSavedMenu();[...menu.children].find(x=>!x.disabled)?.focus({preventScroll:true});};button.addEventListener('click',e=>{e.stopPropagation?.();toggleMenu();});cardTrigger.addEventListener('click',e=>{e.stopPropagation?.();if(isMobilePicker())toggleMenu();});menu.addEventListener('click',e=>e.stopPropagation?.());menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeSavedMenu(true);return;}if(e.key==='Tab'){closeSavedMenu();return;}const options=[...menu.children].filter(x=>!x.disabled),index=options.indexOf(document.activeElement);let next=index;if(e.key==='ArrowDown')next=(index+1)%options.length;else if(e.key==='ArrowUp')next=(index-1+options.length)%options.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=options.length-1;else return;e.preventDefault();e.stopPropagation?.();options[next]?.focus();});body.append(menu);card.append(button,cardTrigger);}
document.addEventListener('pointerdown',e=>{if(savedMenu&&!savedMenu.menu.contains(e.target)&&!savedMenu.button.contains(e.target)&&!savedMenu.cardTrigger.contains(e.target))closeSavedMenu();});for(const event of ['resize','scroll'])window.addEventListener(event,positionSavedMenu,{passive:true});$('#galleryContent').addEventListener('scroll',()=>{closeSavedMenu();closeDropdown('albumSort');},{passive:true});$('#albumHistoryDialog').addEventListener('close',()=>{closeSavedMenu();$('#galleryContent').scrollTop=0;});
const floatingPanels={user:{button:'#userMenuButton',panel:'#userMenu',width:220},color:{button:'#colorButton',panel:'#colorPanel',width:280}};
function positionFloating(key){const data=floatingPanels[key],panel=$(data.panel);if(panel.hidden)return;Object.assign(panel.style,popupPlacement($(data.button).getBoundingClientRect(),data.width,Math.min(560,(panel.scrollHeight||400)+Math.max(0,panel.offsetHeight-panel.clientHeight)),key==='color'));}
function closeFloating(key,focus=false){if(key==='user'&&typeof dropdowns!=='undefined'&&dropdowns.music)closeDropdown('music');const data=floatingPanels[key],panel=$(data.panel);panel.hidden=true;$(data.button).setAttribute('aria-expanded','false');if(focus)$(data.button).focus({preventScroll:true});}
function openFloating(key){if(busy)return;const data=floatingPanels[key],panel=$(data.panel);if(!panel.hidden){closeFloating(key,true);return;}for(const other of Object.keys(floatingPanels))closeFloating(other);for(const other of Object.keys(dropdowns))closeDropdown(other);panel.hidden=false;$(data.button).setAttribute('aria-expanded','true');positionFloating(key);panel.querySelector?.('button:not([hidden])')?.focus({preventScroll:true});}
for(const [key,data]of Object.entries(floatingPanels)){$(data.button).addEventListener('click',()=>openFloating(key));$(data.panel).addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeFloating(key,true);return;}if(e.key==='Tab'){if(key!=='user')closeFloating(key);return;}if(key!=='user'||e.target?.closest?.('#musicMenu')||e.target?.id==='musicButton'||['INPUT','SELECT'].includes(e.target?.tagName))return;const buttons=[...$(data.panel).querySelectorAll('button,input,select')].filter(b=>!b.hidden&&!b.disabled),index=buttons.indexOf(document.activeElement);let next=index;if(e.key==='ArrowDown')next=(index+1)%buttons.length;else if(e.key==='ArrowUp')next=(index-1+buttons.length)%buttons.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=buttons.length-1;else return;e.preventDefault();buttons[next]?.focus();});}
document.addEventListener('pointerdown',e=>{for(const[key,data]of Object.entries(floatingPanels))if(!$(data.panel).hidden&&!$(data.panel).contains(e.target)&&!$(data.button).contains(e.target))closeFloating(key);});
for(const type of ['resize','scroll'])window.addEventListener(type,()=>{for(const key of Object.keys(floatingPanels))positionFloating(key);},{passive:true});
const dropdowns={weather:{button:'#weatherButton',label:'#weatherLabel',menu:'#weatherMenu',input:'#weatherChoice',scroll:0,opened:false,closedValue:null,signature:''},music:{button:'#musicButton',label:'#musicLabel',menu:'#musicMenu',input:'#musicTrack',scroll:0,opened:false,closedValue:null,signature:'',select:(value,event)=>window.groveAudio?.selectTrack(value,event)},oddityCategory:{button:'#oddityCategoryButton',label:'#oddityCategoryLabel',menu:'#oddityCategoryMenu',input:'#oddityCategoryChoice',scroll:0,opened:false,closedValue:null,signature:''},albumSort:{button:'#albumSortButton',label:'#albumSortLabel',menu:'#albumSortMenu',input:'#albumSort',scroll:0,opened:false,closedValue:null,signature:''},biome:{button:'#biomeButton',label:'#biomeLabel',menu:'#biomeMenu',input:'#biomeChoice',scroll:0,opened:false,closedValue:null,signature:''}};
const weatherGlyphs={
 clear:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 atmosphere:'M3 8h13m-10 4h15M3 16h13',rain:'M12 3C10 6 5 11 5 15a7 7 0 0 0 14 0c0-4-5-9-7-12Z',
 thunder:'M5 11a4 4 0 0 1 3-6 5 5 0 0 1 9 3 3 3 0 0 1 1 6h-3m-5-2-3 5h5l-3 5',
 snow:'M12 3v18M4 7l16 10M4 17 20 7M9 5l3 3 3-3m-6 14 3-3 3 3',
 wind:'M3 8h12a2 2 0 1 0-2-2M3 12h16a2 2 0 1 1-2 2M3 16h8a2 2 0 1 1-2 2',
 smoke:'M8 21c-4-4 5-4 1-8s4-4 1-9m7 17c-4-4 5-4 1-8s4-4 1-9',
 smog:'M4 8c3 0 3-4 6-4s4 4 7 4h3M3 12h18M3 16h18m-15 4h12'
};
function weatherOptionGlyph(value){
 const families={'mist-wisps':'atmosphere',mist:'atmosphere',fog:'atmosphere',drizzle:'rain','heavy-rain':'rain',thunderstorm:'thunder',flurries:'snow',blizzard:'snow',breeze:'wind',gusts:'wind'};
 const path=weatherGlyphs[families[value]||value];
 return path?`<svg class="weather-option-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`:'';
}
const musicOptionIcon='<svg class="music-option-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/></svg>';
function syncDropdown(key,entries,value,placeholder){const data=dropdowns[key],menu=$(data.menu),signature=JSON.stringify(entries);data.entries=entries;data.value=value;$(data.label).textContent=entries.find(x=>x.value===value)?.label||placeholder;if(data.signature!==signature){data.signature=signature;const scroll=menu.scrollTop;menu.replaceChildren();for(const entry of entries){const option=document.createElement('button');option.type='button';option.className='dropdown-option';option.dataset.value=entry.value;option.setAttribute('role','option');option.tabIndex=-1;option.textContent=entry.label;if(key==='weather'){const icon=weatherOptionGlyph(entry.value);if(icon){option.insertAdjacentHTML('afterbegin',icon);}}if(key==='music'){option.insertAdjacentHTML('afterbegin',musicOptionIcon);option.setAttribute('data-audio-control','');option.setAttribute('data-audio-action','');}option.addEventListener('click',e=>{if(busy&&key!=='music')return;const input=$(data.input);input.value=entry.value;data.value=entry.value;closeDropdown(key,true);if(data.select)data.select(entry.value,e);else input.dispatchEvent(new Event('change',{bubbles:true}));});menu.append(option);}menu.scrollTop=scroll;}for(const option of menu.children)option.setAttribute('aria-selected',String(option.dataset.value===value));}
window.groveMusicPicker=value=>{$('#musicButton').dataset.track=value;syncDropdown('music',[{value:'off',label:'Off'},{value:'gentle',label:'Gentle'},{value:'haunted',label:'Haunted'},{value:'cosmic',label:'Cosmic'}],value,'Off');};window.groveMusicPicker('off');
const oddityCategoryLabels={all:'All',animals:'Animals',characters:'Characters',props:'Props',plants:'Plants',mushrooms:'Fungi',nature:'Nature',bones:'Bones',structures:'Structures',magic:'Magic',sky:'Sky'};
function syncOddityCategoryPicker(){if(!oddityCategoryLabels[oddityCategory])oddityCategory='all';$('#oddityCategoryChoice').value=oddityCategory;syncDropdown('oddityCategory',Object.entries(oddityCategoryLabels).sort(([a,al],[b,bl])=>a==='all'?-1:b==='all'?1:al.localeCompare(bl)).map(([value,label])=>({value,label})),oddityCategory,'All');syncOddityCategoryTrigger();}
function allOdditiesLabel(){return matchMedia('(max-width:650px)').matches?'All':'All oddities';}
function syncOddityCategoryTrigger(){const label=allOdditiesLabel();if(oddityCategory==='all')$('#oddityCategoryLabel').textContent=label;}
matchMedia('(max-width:650px)').addEventListener('change',syncOddityCategoryTrigger);
const albumSortLabels={newest:'Most Recent',oldest:'Chronological',az:'Alphabetical'};
function syncAlbumSort(){$('#albumSort').value=albumSort;syncDropdown('albumSort',Object.entries(albumSortLabels).filter(([value])=>collection==='album'||value!=='az').map(([value,label])=>({value,label})),albumSort,'Most Recent');}
$('#albumSort').addEventListener('change',e=>{if(!albumSortLabels[e.target.value]||collection==='history'&&e.target.value==='az')return;const previousSort=albumHistoryRenderedSort;albumSort=e.target.value;albumHistorySorts[collection]=albumSort;openAlbumHistory(collection,false,{preserveLayout:true,previousSort});});
function syncBiomePicker(){const entries=biomeNames.filter(id=>id!=='none').sort((a,b)=>biomeLabels[a].localeCompare(biomeLabels[b])).map(id=>({value:id,label:biomeLabels[id]}));entries.unshift({value:'none',label:biomeLabels.none});syncDropdown('biome',entries,state.background,biomeLabels.none);}
function dropdownPlacement(box,desiredHeight,vh){
 const margin=12,seam=1,below=Math.max(0,vh-margin-box.bottom+seam),above=Math.max(0,box.top-margin+seam);
 const up=below<desiredHeight&&above>below,available=up?above:below;
 if(available<44)return{side:'detached',top:margin,maxHeight:Math.max(1,vh-2*margin)};
 const maxHeight=Math.max(1,Math.min(desiredHeight,available));
 return{side:up?'above':'below',top:up?box.top+seam-maxHeight:box.bottom-seam,maxHeight};
}
function positionDropdown(key){
 const data=dropdowns[key],menu=$(data.menu),button=$(data.button);if(menu.hidden)return;
 const box=button.getBoundingClientRect(),margin=12,vw=window.innerWidth||400,vh=window.innerHeight||800;
 const sceneMenu=key==='biome'||key==='weather';
 const drawingWidth=sceneMenu?$('#garden').getBoundingClientRect().width:0;
 const compact=sceneMenu&&drawingWidth>0&&drawingWidth<=360;
 const width=Math.max(1,Math.min(compact?Math.max(176,box.width*2):box.width,vw-2*margin));
 const left=Math.max(margin,Math.min(box.left,vw-margin-width));
 menu.dataset.extendsLeft=String(left<box.left-1);
 menu.dataset.extendsRight=String(left+width>box.left+box.width+1);
 menu.style.width=width+'px';
 // Measure the joined menu without the seam padding before choosing its side.
 menu.dataset.dropdownSide='below';
 const desiredHeight=(menu.scrollHeight||44)+Math.max(0,menu.offsetHeight-menu.clientHeight);
 const {side,top,maxHeight}=dropdownPlacement(box,['weather','biome','oddityCategory'].includes(key)?Math.min(320,desiredHeight):desiredHeight,vh);
 if(key==='albumSort')menu.classList.toggle('sort-overflow',maxHeight<desiredHeight);
 menu.dataset.dropdownSide=side;button.dataset.dropdownSide=side;
 Object.assign(menu.style,{left:left+'px',top:top+'px',bottom:'auto',maxHeight:maxHeight+'px'});
}
function closeDropdown(key,focus=false){const data=dropdowns[key],menu=$(data.menu);if(menu.hidden)return;data.scroll=menu.scrollTop;data.closedValue=data.value;menu.hidden=true;$(data.button).setAttribute('aria-expanded','false');if(focus)$(data.button).focus({preventScroll:true});}
function alignDropdownOpenScroll(menu){
 const max=Math.max(0,menu.scrollHeight-menu.clientHeight),at=menu.scrollTop;
 if(at<=0||at>=max-1)return;
 let closest=0;
 for(const option of menu.children){
  const top=option.offsetTop;
  if(top<=max&&Math.abs(top-at)<Math.abs(closest-at))closest=top;
 }
 menu.scrollTop=closest;
}
function openDropdown(key){if(busy&&key!=='music')return;for(const other of Object.keys(floatingPanels))if(key!=='music'||other!=='user')closeFloating(other);const data=dropdowns[key],menu=$(data.menu);if(!menu.hidden){closeDropdown(key,true);return;}for(const other of Object.keys(dropdowns))if(other!==key)closeDropdown(other);menu.hidden=false;positionDropdown(key);menu.scrollTop=data.scroll;const selectedOption=[...menu.children].find(x=>x.dataset.value===data.value)||menu.children[0];if(!data.opened||data.closedValue!==data.value){if(selectedOption)menu.scrollTop=Math.max(0,selectedOption.offsetTop-(menu.clientHeight-selectedOption.offsetHeight)/2);}alignDropdownOpenScroll(menu);data.opened=true;$(data.button).setAttribute('aria-expanded','true');selectedOption?.focus({preventScroll:true});}
for(const [key,data] of Object.entries(dropdowns)){const button=$(data.button),menu=$(data.menu);button.addEventListener('click',()=>openDropdown(key));button.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(menu.hidden)openDropdown(key);}});menu.addEventListener('scroll',()=>{data.scroll=menu.scrollTop;},{passive:true});menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation?.();closeDropdown(key,true);return;}if(e.key==='Tab'){closeDropdown(key);return;}const options=[...menu.children],index=options.indexOf(document.activeElement);let next=index;if(e.key==='ArrowDown')next=Math.min(options.length-1,index+1);else if(e.key==='ArrowUp')next=Math.max(0,index-1);else if(e.key==='Home')next=0;else if(e.key==='End')next=options.length-1;else return;e.preventDefault();e.stopPropagation?.();options[next]?.focus({preventScroll:true});options[next]?.scrollIntoView({block:'nearest'});});}
document.addEventListener('pointerdown',e=>{for(const [key,data]of Object.entries(dropdowns))if(!$(data.menu).hidden&&!$(data.menu).contains(e.target)&&!$(data.button).contains(e.target))closeDropdown(key);});
window.addEventListener('resize',()=>{if(ready){syncDragSurface();syncHandles();}for(const key of Object.keys(dropdowns))positionDropdown(key);});window.addEventListener('scroll',()=>{for(const key of Object.keys(dropdowns))positionDropdown(key);},{passive:true});
function pointerPosition(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*H};}
const normalizeAngle=angle=>((angle+180)%360+360)%360-180;
function oddityCenter(item){const d=dimensions(item);return{x:item.x,y:item.y-d.h/2};}
function rotatePoint(x,y,angle){const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return{x:x*c-y*s,y:x*s+y*c};}
function insideOddity(item,p){const d=dimensions(item),center=oddityCenter(item),local=rotatePoint(p.x-center.x,p.y-center.y,-(item.rotation||0));if(local.x < -d.w/2||local.x>d.w/2||local.y < -d.h/2||local.y>d.h/2)return false;const sprite=sprites.get(item.id);if(!sprite)return false;let u=local.x/d.w+.5,v=local.y/d.h+.5;if(item.flip)u=1-u;if(item.flipY)v=1-v;const x=Math.min(sprite.width-1,Math.max(0,Math.floor(u*sprite.width))),y=Math.min(sprite.height-1,Math.max(0,Math.floor(v*sprite.height)));return sprite.getContext('2d').getImageData(x,y,1,1).data[3]>25;}
function hitOddity(p){return[...state.items].sort((a,b)=>(a.order??state.items.indexOf(a))-(b.order??state.items.indexOf(b))).reverse().find(item=>insideOddity(item,p));}
function syncDragSurface(){const el=$('#selectedDragSurface'),item=activeOddity();el.hidden=!item||busy;if(!item||busy)return;const d=dimensions(item),shape=hitShapes.get(item.id)||[[0,0],[100,0],[100,100],[0,100]];Object.assign(el.style,{left:(item.x-d.w/2)/W*100+'%',top:(item.y-d.h)/H*100+'%',width:d.w/W*100+'%',height:d.h/H*100+'%',transform:'rotate('+(item.rotation||0)+'deg)',transformOrigin:'50% 50%',clipPath:'polygon('+shape.map(([x,y])=>(item.flip?100-x:x)+'% '+(item.flipY?100-y:y)+'%').join(',')+')'});}
const handleIds={nw:'#resizeNW',ne:'#resizeNE',se:'#resizeSE',sw:'#resizeSW'};
function syncHandles(){const container=$('#selectionHandles'),item=activeOddity();container.hidden=!item||busy;if(!item||busy)return;const d=dimensions(item),center=oddityCenter(item),box=canvas.getBoundingClientRect(),scale=W/Math.max(1,box.width),halfW=Math.max(d.w/2,36*scale),halfH=Math.max(d.h/2,26*scale);for(const[key,[x,y]]of Object.entries({nw:[-halfW,-halfH],ne:[halfW,-halfH],se:[halfW,halfH],sw:[-halfW,halfH]})){const point=rotatePoint(x,y,item.rotation||0),px=center.x+point.x,py=center.y+point.y,el=$(handleIds[key]);el.hidden=px<0||px>W||py<0||py>H;el.style.left=px/W*100+'%';el.style.top=py/H*100+'%';el.disabled=busy;}}
function rotateActive(degrees,keepUndo=true){const item=activeOddity();if(!item||busy)return;const angle=normalizeAngle(degrees);if(angle===(item.rotation||0))return;if(keepUndo)remember();item.rotation=angle;render();}
const touchContacts=new Map();
function captureTouch(e){if(e.pointerType!=='touch')return;touchContacts.set(e.pointerId,{point:pointerPosition(e),target:e.currentTarget||canvas});$('.canvas-wrap').classList.add('touch-editing');}
function releaseTouch(id){const contact=touchContacts.get(id);touchContacts.delete(id);if(!touchContacts.size)$('.canvas-wrap').classList.remove('touch-editing');try{if(contact?.target.hasPointerCapture?.(id))contact.target.releasePointerCapture(id);}catch{}}
function clearTouches(){for(const id of [...touchContacts.keys()])releaseTouch(id);}
function trackTouch(e){const contact=touchContacts.get(e.pointerId);if(contact)contact.point=pointerPosition(e);}
function beginPinch(e){if(e.pointerType!=='touch'||touchContacts.has(e.pointerId)||touchContacts.size!==1||pinchGesture||!activeOddity()||busy||(!drag||drag.tap)&&(!transformGesture||transformGesture.keyboard))return false;const previous=drag&&!drag.tap?drag:transformGesture,item=activeOddity();e.preventDefault?.();e.stopPropagation?.();try{e.currentTarget.setPointerCapture?.(e.pointerId);}catch{return false;}captureTouch(e);const [a,b]=[...touchContacts.values()].map(x=>x.point),middle={x:(a.x+b.x)/2,y:(a.y+b.y)/2},vector={x:b.x-a.x,y:b.y-a.y};pinchGesture={uid:item.uid,before:previous.before,changed:previous.changed,original:clone(item),center:oddityCenter(item),middle,distance:Math.max(1,Math.hypot(vector.x,vector.y)),lastVector:vector,angle:Math.atan2(vector.y,vector.x),angleDelta:0,deadzone:8*W/Math.max(1,canvas.getBoundingClientRect().width)};drag=null;transformGesture=null;return true;}
function movePinch(e){if(!pinchGesture||!touchContacts.has(e.pointerId))return false;e.preventDefault?.();trackTouch(e);const gesture=pinchGesture,item=activeOddity();if(!item||item.uid!==gesture.uid||busy)return true;const [a,b]=[...touchContacts.values()].map(x=>x.point);if(!b)return true;const middle={x:(a.x+b.x)/2,y:(a.y+b.y)/2},vector={x:b.x-a.x,y:b.y-a.y},distance=Math.hypot(vector.x,vector.y),angle=Math.atan2(vector.y,vector.x);if(!segmentNearCenter(gesture.lastVector,vector,{x:0,y:0},gesture.deadzone))gesture.angleDelta+=normalizeAngle((angle-gesture.angle)*180/Math.PI);gesture.lastVector=vector;gesture.angle=angle;const size=Math.max(40,Math.min(MAX_SIZE,gesture.original.size*distance/gesture.distance)),ratio=size/gesture.original.size,rotation=normalizeAngle((gesture.original.rotation||0)+gesture.angleDelta),offset=rotatePoint((gesture.center.x-gesture.middle.x)*ratio,(gesture.center.y-gesture.middle.y)*ratio,gesture.angleDelta),x=Math.max(-MAX_SIZE,Math.min(W+MAX_SIZE,middle.x+offset.x)),y=Math.max(-MAX_SIZE,Math.min(H+MAX_SIZE,middle.y+offset.y+dimensions({...item,size}).h/2));if(!gesture.changed&&Math.abs(size-item.size)<.1&&Math.abs(normalizeAngle(rotation-(item.rotation||0)))<.1&&Math.hypot(x-item.x,y-item.y)<2)return true;if(!gesture.changed){remember(gesture.before);gesture.changed=true;}Object.assign(item,{x,y,size,rotation});render();return true;}
function finishPinch(e,cancel=false){if(!pinchGesture||!touchContacts.has(e.pointerId))return false;const previous=pinchGesture;pinchGesture=null;if(cancel){drag=null;transformGesture=null;clearTouches();return true;}releaseTouch(e.pointerId);const remaining=[...touchContacts.entries()][0],item=activeOddity();if(remaining&&item){const[id,contact]=remaining;drag={pointerId:id,start:contact.point,original:{x:item.x,y:item.y},before:previous.before,changed:previous.changed,target:contact.target};}else clearTouches();return true;}
function startTransform(e,kind){if(beginPinch(e))return;if(!ready||busy||!activeOddity()||pinchGesture||transformGesture||drag||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault?.();e.stopPropagation?.();const item=activeOddity(),point=pointerPosition(e),center=oddityCenter(item);transformGesture={kind,pointerId:e.pointerId,target:e.currentTarget,uid:item.uid,before:snapshot(),original:clone(item),center,start:point,last:point,distance:Math.max(1,Math.hypot(point.x-center.x,point.y-center.y)),lastAngle:Math.atan2(point.y-center.y,point.x-center.x),angleDelta:0,deadzone:8*W/Math.max(1,canvas.getBoundingClientRect().width),changed:false};try{e.currentTarget.setPointerCapture?.(e.pointerId);captureTouch(e);}catch{transformGesture=null;}}
function segmentNearCenter(a,b,center,radius){const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((center.x-a.x)*dx+(center.y-a.y)*dy)/length)):0;return Math.hypot(a.x+t*dx-center.x,a.y+t*dy-center.y)<radius;}
function moveTransform(e){if(movePinch(e))return;if(!transformGesture&&drag?.pointerId===e.pointerId){pointerMove(e);return;}trackTouch(e);const gesture=transformGesture,item=activeOddity();if(!gesture||gesture.keyboard||gesture.pointerId!==e.pointerId||!item||item.uid!==gesture.uid||busy)return;e.preventDefault?.();const p=pointerPosition(e),distance=Math.hypot(p.x-gesture.center.x,p.y-gesture.center.y),angle=Math.atan2(p.y-gesture.center.y,p.x-gesture.center.x);if(!segmentNearCenter(gesture.last,p,gesture.center,gesture.deadzone)){gesture.angleDelta+=normalizeAngle((angle-gesture.lastAngle)*180/Math.PI);}gesture.last=p;gesture.lastAngle=angle;if(!gesture.changed&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)<4)return;const size=gesture.kind==='sw'?gesture.original.size:Math.max(40,Math.min(MAX_SIZE,gesture.original.size*distance/gesture.distance)),rotation=gesture.kind==='sw'?normalizeAngle((gesture.original.rotation||0)+gesture.angleDelta):(gesture.original.rotation||0);if(!gesture.changed&&Math.abs(size-item.size)<.01&&Math.abs(normalizeAngle(rotation-(item.rotation||0)))<.01)return;if(!gesture.changed){remember(gesture.before);gesture.changed=true;}item.size=size;item.rotation=rotation;item.x=gesture.center.x;item.y=Math.max(-MAX_SIZE,Math.min(H+MAX_SIZE,gesture.center.y+dimensions(item).h/2));render();}
function endTransform(e){if(e&&finishPinch(e,e.type==='pointercancel'||e.type==='lostpointercapture'))return;if(!transformGesture&&drag?.pointerId===e?.pointerId){pointerUp(e);return;}const gesture=transformGesture;if(!gesture||(!gesture.keyboard&&e?.pointerId!==undefined&&gesture.pointerId!==e.pointerId))return;transformGesture=null;releaseTouch(gesture.pointerId);try{if(gesture.target?.hasPointerCapture?.(gesture.pointerId))gesture.target.releasePointerCapture(gesture.pointerId);}catch{}}
for(const [kind,id]of Object.entries(handleIds)){const handle=$(id);handle.addEventListener('pointerdown',e=>startTransform(e,kind));handle.addEventListener('pointermove',moveTransform);handle.addEventListener('pointerup',endTransform);handle.addEventListener('pointercancel',e=>{if(!finishPinch(e,true))endTransform(e);});handle.addEventListener('lostpointercapture',e=>{if(!finishPinch(e,true))endTransform(e);});handle.addEventListener('keydown',e=>{if(busy||!activeOddity()||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)||transformGesture&&!transformGesture.keyboard)return;e.preventDefault();e.stopPropagation?.();if(!transformGesture){remember();transformGesture={keyboard:true};}if(kind==='sw')rotateActive((activeOddity().rotation||0)+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1)*(e.shiftKey?1:5),false);else resizeActive(activeOddity().size+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1)*(e.shiftKey?5:25),false);});handle.addEventListener('keyup',endTransform);handle.addEventListener('blur',()=>endTransform());}
function pointerDown(e){if(document.body.classList.contains('grove-view'))return;if(beginPinch(e))return;if(!ready||busy||drag||transformGesture||pinchGesture||(e.pointerType==='mouse'&&e.button!==0))return;const p=pointerPosition(e);keyboard=false;let item=activeOddity(),switched=false;const hit=hitOddity(p);if(hit&&hit.uid!==item?.uid&&(e.pointerType==='mouse'||e.pointerType==='touch')){activeUid=hit.uid;item=hit;switched=true;render();}const direct=!!item&&insideOddity(item,p)&&(e.currentTarget===$('#selectedDragSurface')||e.pointerType==='mouse'||switched);if(direct){mode='move';drag={pointerId:e.pointerId,start:p,original:{x:item.x,y:item.y},before:snapshot(),changed:false,target:e.currentTarget||canvas};drag.target.setPointerCapture?.(e.pointerId);captureTouch(e);e.preventDefault?.();}else{drag={pointerId:e.pointerId,start:p,tap:true,candidate:item?(insideOddity(item,p)?item.uid:null):hit?.uid||null};}render();}
function pointerMove(e){if(movePinch(e))return;trackTouch(e);if(!drag||drag.pointerId!==e.pointerId||busy)return;const p=pointerPosition(e);if(drag.tap){if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>20)drag.moved=true;return;}const item=activeOddity();if(!item)return;if(!drag.changed&&Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>5){remember(drag.before);drag.changed=true;}if(drag.changed){item.x=Math.max(-MAX_SIZE,Math.min(W+MAX_SIZE,drag.original.x+p.x-drag.start.x));item.y=Math.max(-MAX_SIZE,Math.min(H+MAX_SIZE,drag.original.y+p.y-drag.start.y));e.preventDefault?.();render();}}
function pointerUp(e){if(finishPinch(e))return;if(!drag||drag.pointerId!==e.pointerId)return;const p=pointerPosition(e),was=drag;drag=null;releaseTouch(e.pointerId);if(was.target?.hasPointerCapture?.(e.pointerId))was.target.releasePointerCapture(e.pointerId);if(was.tap&&!was.moved&&Math.hypot(p.x-was.start.x,p.y-was.start.y)<20){activeUid=was.candidate;render();}}
function cancelDrag(e){if(e&&finishPinch(e,true))return;if(!drag||e?.pointerId!==undefined&&drag.pointerId!==e.pointerId)return;const previous=drag;drag=null;releaseTouch(previous.pointerId);try{if(previous.target?.hasPointerCapture?.(previous.pointerId))previous.target.releasePointerCapture(previous.pointerId);}catch{}}
for(const surface of [canvas,$('#selectedDragSurface')]){surface.addEventListener('pointerdown',pointerDown);surface.addEventListener('pointermove',pointerMove);surface.addEventListener('pointerup',pointerUp);surface.addEventListener('pointercancel',cancelDrag);surface.addEventListener('lostpointercapture',cancelDrag);}
function deselectOutsideClick(event){if(pickerDragController?.suppressClick(event))return;if(!ready||busy||!activeOddity()||drag||transformGesture||pinchGesture||document.body.classList.contains('grove-view'))return;const target=event.target;if(target===canvas||$('#selectedDragSurface').contains(target)||$('#selectionHandles').contains(target)||$('#transformTools').contains(target))return;activeUid=null;render();}
document.addEventListener('click',deselectOutsideClick,{capture:true});
for(const type of ['pointerup','pointercancel'])document.addEventListener(type,event=>{if(drag?.tap)cancelDrag(event);});

function flipActive(axis){const item=activeOddity();if(!item||busy)return;remember();item[axis]=!item[axis];render();}
function bringActiveToFront(){const item=activeOddity();if(!item||busy)return false;const ordered=[...state.items].sort((a,b)=>(a.order??state.items.indexOf(a))-(b.order??state.items.indexOf(b)));if(ordered.at(-1)===item)return false;remember();ordered.splice(ordered.indexOf(item),1);ordered.push(item);ordered.forEach((value,index)=>{value.order=index;});state.items=ordered;render();return true;}
function sendActiveToBack(){const item=activeOddity();if(!item||busy)return false;const ordered=[...state.items].sort((a,b)=>(a.order??state.items.indexOf(a))-(b.order??state.items.indexOf(b)));if(ordered[0]===item)return false;remember();ordered.splice(ordered.indexOf(item),1);ordered.unshift(item);ordered.forEach((value,index)=>{value.order=index;});state.items=ordered;render();return true;}
$('#bringToFront').addEventListener('click',bringActiveToFront);
$('#sendToBack').addEventListener('click',sendActiveToBack);
$('#flipHorizontal').addEventListener('click',()=>flipActive('flip'));$('#flipVertical').addEventListener('click',()=>flipActive('flipY'));
canvas.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(busy||document.body.classList.contains('grove-view'))return;if(['Enter','Home','End','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Escape')activeUid=null;else if(state.items.length){const index=state.items.findIndex(x=>x.uid===activeUid),next=e.key==='Home'?0:e.key==='End'?state.items.length-1:index<0?(e.shiftKey?state.items.length-1:0):(index+(e.shiftKey?-1:1)+state.items.length)%state.items.length;activeUid=state.items[next].uid;}render();return;}if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','=','-','[',']'].includes(e.key))return;const item=activeOddity();if(!item)return;e.preventDefault();if(!e.repeat)remember();if(['+','=','-'].includes(e.key)){resizeActive(item.size+(e.key==='-'?-25:25),false);return;}if(['[',']'].includes(e.key)){rotateActive((item.rotation||0)+(e.key==='['?-5:5),false);return;}if(e.key==='ArrowUp')item.y-=15;if(e.key==='ArrowDown')item.y+=15;if(e.key==='ArrowLeft')item.x-=15;if(e.key==='ArrowRight')item.x+=15;item.x=Math.max(-MAX_SIZE,Math.min(W+MAX_SIZE,item.x));item.y=Math.max(-MAX_SIZE,Math.min(H+MAX_SIZE,item.y));render();});
canvas.addEventListener('blur',()=>{keyboard=false;paintFrame(animationTime);});
$('#oddityCategoryChoice').addEventListener('change',e=>{if(busy||!oddityCategoryLabels[e.target.value])return;oddityCategory=e.target.value;favoritesOnly=false;$('#favoriteFilter').setAttribute('aria-pressed','false');selected=null;$('#odditySearch').value='';renderOddities();render();});
$('#odditySearch').addEventListener('input',renderOddities);$('#favoriteFilter').addEventListener('click',()=>{if(!requireAccount('open your favorite oddities'))return;favoritesOnly=!favoritesOnly;selected=null;$('#odditySearch').value='';renderOddities();render();});
document.querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>{if(busy)return;remember();state.palette=b.dataset.palette;render();closeFloating('color');}));
$('#biomeChoice').addEventListener('change',e=>chooseBiome(e.target.value));$('#weatherChoice').addEventListener('change',e=>{const value=e.target.value;if(busy||!weatherChoices.some(option=>option.value===value))return;const next=value==='clear'?[]:[value];if(JSON.stringify(next)===JSON.stringify(state.weather))return;remember();state.weather=next;render();});
$('#copyItem').addEventListener('click',copyActive);$('#removeItem').addEventListener('click',removeActiveOddity);
function removeActiveOddity(){if(!activeOddity()||busy)return false;remember();state.items=state.items.filter(x=>x.uid!==activeUid);activeUid=null;render();window.groveAudio?.effect('remove');return true;}
function deleteSelectedOddityShortcut(event){
 if(event.defaultPrevented||event.isComposing||!['Delete','Backspace'].includes(event.key)||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||busy||!activeOddity()||document.body.classList.contains('grove-view'))return;
 const editing=element=>element?.isContentEditable||element?.closest?.('input,textarea,select,[role=textbox]');
 if(editing(event.target)||editing(document.activeElement)||document.querySelector('dialog[open]'))return;
 if([...document.querySelectorAll('.dropdown-menu,.floating-panel,[role=menu]')].some(menu=>!menu.closest('[hidden]')&&menu.getClientRects().length))return;
 if(removeActiveOddity())event.preventDefault();
}
let oddityClipboard=null;
function oddityClipboardShortcut(event){
 if(!ready||busy||event.defaultPrevented||event.isComposing||event.repeat||event.altKey||event.shiftKey||event.ctrlKey===event.metaKey)return;
 const key=event.key.toLowerCase();
 if(!['c','x','v'].includes(key)||document.body.classList.contains('grove-view')||document.querySelector('dialog[open]'))return;
 const nativeTarget=element=>element?.isContentEditable||element?.closest?.('input,textarea,select');
 if(nativeTarget(event.target)||nativeTarget(document.activeElement)||window.getSelection()?.toString())return;
 if(key==='v'){
  if(!duplicateOddity(oddityClipboard))return;
 }else{
  const item=activeOddity();
  if(!item)return;
  const snapshot=clone(item);
  if(key==='x'&&!removeActiveOddity())return;
  oddityClipboard=snapshot;
 }
 event.preventDefault();
}
document.addEventListener('keydown',oddityClipboardShortcut);
document.addEventListener('keydown',deleteSelectedOddityShortcut);
$('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);document.addEventListener('keydown',e=>{const tag=document.activeElement?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag)||busy||document.body.classList.contains('grove-view')||[...document.querySelectorAll('dialog')].some(dialog=>dialog.open))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}});$('#clear').addEventListener('click',()=>{closeFloating('user');return startNewGrove();});$('#saveAlbum').addEventListener('click',saveToAlbum);$('#save').addEventListener('click',savePicture);$('#share').addEventListener('click',sharePicture);$('#openAlbum').addEventListener('click',()=>{closeFloating('user');return openAlbumHistory('album');});$('#openHistory').addEventListener('click',()=>{closeFloating('user');return openAlbumHistory('history');});$('#closeGallery').addEventListener('click',()=>$('#albumHistoryDialog').close());document.querySelectorAll('[data-gallery]').forEach(b=>b.addEventListener('click',()=>openAlbumHistory(b.dataset.gallery)));$('#loadMore').addEventListener('click',()=>openAlbumHistory(collection,true));document.addEventListener('grove-album-imported',()=>openAlbumHistory('album'));document.addEventListener('visibilitychange',()=>{if(ready)manageAnimation();});
function hitOutline(sprite){const w=sprite.width,h=sprite.height,pixels=sprite.getContext('2d').getImageData(0,0,w,h).data,left=[],right=[],step=Math.max(1,Math.ceil(h/36));for(let y=0;y<h;y+=step){let min=w,max=-1;for(let yy=y;yy<Math.min(h,y+step);yy++)for(let x=0;x<w;x++)if(pixels[(yy*w+x)*4+3]>35){min=Math.min(min,x);max=Math.max(max,x);}if(max>=min){left.push([min/w*100,y/h*100],[min/w*100,Math.min(h,y+step)/h*100]);right.push([(max+1)/w*100,y/h*100],[(max+1)/w*100,Math.min(h,y+step)/h*100]);}}return [...left,...right.reverse()];}
function loadSheet(key,[src,cols,rows]){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{try{const cw=Math.floor(im.width/cols),ch=Math.floor(im.height/rows);for(let cell=0;cell<cols*rows;cell++){const entry=oddityCatalog.find(v=>v.sheet===key&&v.cell===cell);if(!entry)continue;const [sx,sy,sw,sh]=customRects[key]?.[cell]||[(cell%cols)*cw,Math.floor(cell/cols)*ch,cw,ch],tile=document.createElement('canvas');tile.width=sw;tile.height=sh;const tc=tile.getContext('2d',{willReadFrequently:true});tc.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);for(const rect of sheetExclusions[key]?.[cell]||[])tc.clearRect(...rect);const pixels=tc.getImageData(0,0,sw,sh).data;let minX=sw,minY=sh,maxX=0,maxY=0;for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(pixels[(y*sw+x)*4+3]>25){minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);}if(maxX<minX||maxY<minY)throw Error('Empty illustration');const cut=document.createElement('canvas');cut.width=maxX-minX+1;cut.height=maxY-minY+1;cut.getContext('2d').drawImage(tile,minX,minY,cut.width,cut.height,0,0,cut.width,cut.height);const id=entry.id;if(id){sprites.set(id,cut);hitShapes.set(id,hitOutline(cut));const thumb=document.createElement('canvas'),scale=112/Math.max(cut.width,cut.height);thumb.width=Math.max(1,Math.round(cut.width*scale));thumb.height=Math.max(1,Math.round(cut.height*scale));thumb.getContext('2d').drawImage(cut,0,0,thumb.width,thumb.height);thumbs.set(id,thumb.toDataURL('image/webp',.86));}}resolve();}catch(e){reject(e);}};im.onerror=()=>reject(Error('Illustrations could not load. Try refreshing the page.'));im.src=src;});}
const mobilePickerMedia=window.matchMedia?.('(max-width: 650px)');
const isMobilePicker=()=>mobilePickerMedia?mobilePickerMedia.matches:(window.innerWidth||1024)<=650;
const usesOddityModal=()=>isMobilePicker()||document.body.hasAttribute?.('data-oddities-modal');
mobilePickerMedia?.addEventListener('change',syncFirstOddityGuide);
document.addEventListener('grove-picker-layout',()=>{syncFirstOddityGuide();if(catalogReady&&favoritesOnly&&favorites.size===0)renderOddities();});
let pickerHighlightTimer=null;
function scrollToOddities(keyboardFocus=false){for(const key of Object.keys(dropdowns))closeDropdown(key);requestAnimationFrame(()=>{if(keyboardFocus)$('#oddityCategoryButton').focus({preventScroll:true});const picker=$('#oddityPicker');picker.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});picker.classList.add('picker-highlight');clearTimeout(pickerHighlightTimer);pickerHighlightTimer=setTimeout(()=>picker.classList.remove('picker-highlight'),1300);});}
function returnToCanvas(){requestAnimationFrame(()=>{canvas.focus?.({preventScroll:true});$('.garden-panel').scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});});}
$('#toggleOddities').addEventListener('click',e=>scrollToOddities(e.detail===0));
function dismissToast(){const toast=$('#toast');if(!toast.classList.contains('show'))return;const restore=toast.contains(document.activeElement);clearTimeout(toastTimer);toast.classList.remove('show');toast.hidden=true;if(restore)queueMicrotask(()=>focusSafely(toastReturnFocus));}
document.addEventListener('pointerdown',event=>{if(!$('#toast').contains(event.target)&&event.target.closest?.('.grove-scroll-track')?.getAttribute('aria-controls')!=='toast')dismissToast();},{capture:true,passive:true});
for(const dialog of document.querySelectorAll('dialog')){let backdropStart=false;const outside=e=>{const b=dialog.getBoundingClientRect();return e.target===dialog&&(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom);};dialog.addEventListener('pointerdown',e=>{backdropStart=outside(e);});dialog.addEventListener('click',e=>{if(!backdropStart||!outside(e)){backdropStart=false;return;}backdropStart=false;e.preventDefault();e.stopPropagation();if(dialog.id==='startDialog'||dialog.id==='importBackupDialog')return;if((dialog.id==='renameDialog'||dialog.id==='deleteDialog')&&!dialog.dispatchEvent(new Event('cancel',{cancelable:true})))return;dialog.returnValue='cancel';dialog.close();});dialog.addEventListener('close',()=>{const target=dialogReturnFocus.get(dialog),index=dialogStack.indexOf(dialog);if(index>=0)dialogStack.splice(index,1);queueMicrotask(()=>focusSafely(target));});}
function registerTools(){const context=document.modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};register({name:'read_grove',description:'Read the current creation and available item catalogue. It does not read saved Album or History entries.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({scene:snapshot(),catalogue:oddityCatalog.filter(x=>!x.hidden).map(({id,name,oddityCategory})=>({id,name,group:oddityCategory})),selected,mode})});register({name:'place_grove_items',description:'Place the explicitly named items in this creation. Coordinates are between zero and one.',inputSchema:{type:'object',properties:{items:{type:'array',minItems:1,maxItems:20,items:{type:'object',properties:{id:{type:'string',enum:oddityCatalog.filter(x=>!x.hidden).map(x=>x.id)},x:{type:'number',minimum:0,maximum:1},y:{type:'number',minimum:0,maximum:1}},required:['id','x','y'],additionalProperties:false}}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(busy||!ready)throw Error('Editor is busy');if(!input||!Array.isArray(input.items)||!input.items.length||input.items.length>20||input.items.some(v=>!byId[v.id]||!Number.isFinite(v.x)||!Number.isFinite(v.y)||v.x<0||v.x>1||v.y<0||v.y>1)||state.items.length+input.items.length>100)throw Error('Invalid items');remember();for(const item of input.items)state.items.push(makeOddity(item.id,item.x*W,item.y*H));render();noteProgress('first_item');return{itemCount:state.items.length};}});window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
setBusy(true,'Waking the grove...');
// Load catalog sheets in parallel, but only the restored scene's own sheets block the editor.
const sheetLoads=new Map(Object.entries(sources).filter(([key])=>oddityCatalog.some(item=>item.sheet===key)).map(([key,value])=>[key,loadSheet(key,value)]));
for(const sheet of sheetLoads.values())sheet.then(syncIdeaOddityIcons,()=>{});
const catalogLoaded=Promise.all(sheetLoads.values()).then(()=>{catalogReady=true;renderOddities();}).catch(()=>{const status=$('#odditiesLoading');if(status){status.setAttribute('role','alert');status.setAttribute('aria-live','assertive');status.lastElementChild.innerHTML='Oddities could not load.<br>Refresh to try again.';}});
async function bootEditor(){
  try{
    await checkAccount();
    const fromSignIn=await restoreSignInDraft();
    const firstGrove=await restoreCurrentDraft(!!fromSignIn);
    const prepared=await prepareScene(state);
    ready=true;document.body.classList.remove('editor-loading');
    try{localStorage.setItem('whimsy-grove-visited:'+new URL('.',location.href).pathname,'1');}catch{}
    $('#loading').classList.add('gone');renderOddities();render(prepared);setBusy(false);registerTools();
    $('main').removeAttribute('inert');$('#startupLoading').hidden=true;
    if(firstGrove){await startNewGrove(true);}else if(draftPending){queueDraft(true);}
  }catch(error){
    busy=false;canvas.setAttribute?.('aria-busy','false');$('#busyOverlay').hidden=true;
    $('#startupLoading').setAttribute('role','alert');$('#startupLoading').setAttribute('aria-live','assertive');
    $('#startupLoadingText').textContent=error.message||'Your creation could not load. Refresh to try again.';
    $('#startupLoading').classList.add('startup-error');
  }
}
bootEditor();

})();
