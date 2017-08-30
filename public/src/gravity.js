$(document).ready(function () {

	(function init() {
            (function () { // Forbid user edition
                //Create stage in canvas
                var stage = new createjs.Stage("canvas");

                //Store mouse position in here (when clicked)
                var mouse = {
                    startX: 0,
                    startY: 0
                };

                //Store canvas limits
                var canvas = {
                    yStart: 0,
                    yEnd  : 0,
                    xStart: 0,
                    xEnd  : 0
                };

                //Create a list of particles
                particles = [];

                //Set canvas dimensions
                function fillWindow(obj) {
                    obj.width  = window.innerWidth;
                    obj.height = window.innerHeight;
                    canvas.xStart = -4 * obj.width;
                    canvas.xEnd   =  5 * obj.width;
                    canvas.yStart = -4 * obj.height;
                    canvas.yEnd   =  5 * obj.height;
                }
                fillWindow(stage.canvas);

                //Update canvas dimensions on window resize
                $(window).on('resize', function () {
                    fillWindow(stage.canvas);
                });

                //Function to create particles
                function createParticle(x, y, r, vx, vy) {
                    var particle = new createjs.Shape();
                    particle.graphics.f("#2980b9").dc(0, 0, r);
                    particle.regX = particle.regY = -r;
                    particle.x = x;
                    particle.y = y;
                    particle.m = 5;
                    particle.vx = vx;
                    particle.vy = vy;
                    particle.w = particle.h = r * 2;
                    particles.push(particle);
                    stage.addChild(particle);
                }

                //Click events
                stage.on("stagemousedown", function (e) {
                    mouse.startX = e.stageX;
                    mouse.startY = e.stageY;
                });
                stage.on("stagemouseup", function (e) {
                    createParticle(mouse.startX - 5, mouse.startY - 5, 2, (e.stageX - mouse.startX) / 4, (e.stageY - mouse.startY) / 4);
                });

                //Create ticker (frame renders every tick using function tick)
                createjs.Ticker.on("tick", tick);
                createjs.Ticker.setFPS(60);
                var frameDuration = 1000/60;

                //Function to update every frame
                function tick() {
                    //======================================================================
                    // WARNING - PHYSICS AHEAD!
                    //======================================================================

                    for (var i = 0; i < particles.length; i++) {
                        for (var j = 0; j < particles.length; j++) {
                            if(i != j) {
                                //Get distance
                                var diffX = particles[j].x - particles[i].x;
                                var diffY = particles[j].y - particles[i].y;
                                var distSquare = diffX * diffX + diffY * diffY;
                                var dist = Math.sqrt(distSquare);

                                if (dist > particles[i].w/2 + particles[j].w/2) { //No collision
                                    //Get force
                                    var totalForce = 6 * particles[i].m * particles[j].m / distSquare;

                                    //With force, update acceleration
                                    particles[i].vx += (diffX < 0 ? -1 : 1) * totalForce / particles[i].m;
                                    particles[i].vy += (diffY < 0 ? -1 : 1) * totalForce / particles[i].m;
                                } else {
                                    if (particles[i].m >= particles[j].m) {
                                        //Preserve mass center
                                        particles[i].x = (particles[i].m * particles[i].x + particles[j].m * particles[j].x) / (particles[i].m + particles[j].m)
                                        particles[i].y = (particles[i].m * particles[i].y + particles[j].m * particles[j].y) / (particles[i].m + particles[j].m)
                                        //Preserve momentum
                                        particles[i].vx = (particles[i].m*particles[i].vx + particles[j].m*particles[j].vx) / (particles[i].m+particles[j].m);
                                        particles[i].vy = (particles[i].m*particles[i].vy + particles[j].m*particles[j].vy) / (particles[i].m+particles[j].m);
                                        //Preserve mass
                                        particles[i].m += particles[j].m;
                                        //Preserve density
                                        var newR = Math.sqrt(particles[i].w * particles[i].w / 4 + particles[j].w * particles[j].w / 4);
                                        particles[i].w = particles[i].h = 2 * newR;
                                        particles[i].graphics.f("#2980b9").dc(0, 0, newR);
                                        //Get rid of collided particle
                                        stage.removeChild(particles[j]);
                                        particles.splice(j--, 1);
                                    }
                                }
                            }
                        }
                    }

                    //Update particle position (Not before, up there we had a photo for obvious reasons)
                    for (var i = 0; i < particles.length; i++) {
                        particles[i].x += particles[i].vx / frameDuration;
                        particles[i].y += particles[i].vy / frameDuration;

                        //Delete particles that are too far away
                        if (particles[i].x < canvas.xStart || particles[i].x > canvas.xEnd
                         || particles[i].y < canvas.yStart || particles[i].y > canvas.yEnd) {
                            stage.removeChild(particles[i]);
                            particles.splice(i--, 1);
                        }
                    }

                    //Let's tell the canvas to update the positions before rendering!
                    stage.update();
                }
            })();
        })();

});
