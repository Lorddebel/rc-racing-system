$(window).on('load', function() {

    var dataRaces;
    var datatable;
    var userInfo;
    getCredentials ();
    let startTime;
    let elapsedTime = 0;
    let timerInterval;

    getMyRaces();

    console.log(dataRaces);

    datatable = $("#table_races").DataTable( {
        "pageLength": 20,
        "searching": false,
        "lengthChange": false,
        "responsive": true,
        "scrollY": "calc(100vh - 475px)",
        "scrollCollapse": true,
        "order": [[ 0, "desc" ]],
        "data" : dataRaces,
        columns: [
            {"data": "null", "render": function ( data, type, row ) {
                if (row.date == "" || row.date == null) {
                    return "";
                }
                if ( type === 'display' || type === 'filter' ) {
                    var date = row.date.split("T")[0];
                    var day = date.split("-")[2];
                    var month = date.split("-")[1];
                    var year = date.split("-")[0];
                    var time = row.date.split("T")[1].substring(0, 5);
                    return time+" "+day+"/"+month+"/"+year;
                }

                return row.date;} },
            {"data": "null", "render": function ( data, type, row ) {
                if ( type === 'display' || type === 'filter' ) {
                    var minutes = Math.floor( row.sectorTime[0] / 60);
                    var seconds = row.sectorTime[0] - minutes * 60;

                    return minutes+"m "+seconds+"s"
                }

                return row.sectorTime[0]} },
            {"data": "null", "render": function ( data, type, row ) {
                if ( type === 'display' || type === 'filter' ) {
                    var minutes = Math.floor( row.sectorTime[1] / 60);
                    var seconds = row.sectorTime[1] - minutes * 60;

                    return minutes+"m "+seconds+"s"
                }

                return row.sectorTime[1]} },
            {"data": "null", "render": function ( data, type, row ) {
                if ( type === 'display' || type === 'filter' ) {
                    var minutes = Math.floor( row.sectorTime[2] / 60);
                    var seconds = row.sectorTime[2] - minutes * 60;

                    return minutes+"m "+seconds+"s"
                }

                return row.sectorTime[2]} },
            {"data": "null", "render": function ( data, type, row ) {
                if ( type === 'display' || type === 'filter' ) {
                    var minutes = Math.floor( row.overallTime / 60);
                    var seconds = row.overallTime - minutes * 60;

                    return minutes+"m "+seconds+"s"
                }

                return row.overallTime; } }
        ]
    });


    $("#start-race").on('click', function() {
        $('#table_races_wrapper').css('display','none');
        $('#loading-window').css('display','flex');
        $('#race_text').text('Ongoing');
        delay(1500).then(() => startTimer());
        startRaceRequest();

    });


    function getCredentials () {
    	var xmlhttp = new XMLHttpRequest();
    	xmlhttp.onreadystatechange = function() {
    		if(this.readyState == 4 && this.status == 200) {

    			var response = xmlhttp.responseText;

    			userInfo = JSON.parse(response);
    			$("#username").text(userInfo.username);
    			}
    		}
    		xmlhttp.open("GET", "/rest/player", true);
            xmlhttp.send();
    	};

        function getMyRaces () {
            var xmlhttpraces = new XMLHttpRequest();
            xmlhttpraces.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {

                    var response = xmlhttpraces.responseText;

                    dataRaces = JSON.parse(response);
                    }
                }
                xmlhttpraces.open("GET", "/rest/myraces", false);
                xmlhttpraces.send();
            };


        function startRaceRequest () {
            var xmlhttpraces = new XMLHttpRequest();
            xmlhttpraces.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {

                    var response = xmlhttpraces.responseText;

                    if (response == -1.0) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid Race',
                          text: 'You were too slow or something went wrong!',
                        });
                    } else if (response == -2.0) {
                        Swal.fire({
                          icon: 'error',
                          title: 'There is an outgoing race',
                          text: 'Please wait for it to finish!',
                        });
                    } else if (response > 0.0) {
                        Swal.fire({
                              title: "Race Finished. Good job!",
                              text: "Your time:" + response,
                              type: "success"
                              }).then(function() {
                                    location.reload();
                                } );
                    } else {
                        Swal.fire({
                              icon: 'error',
                              title: 'Invalid Race',
                              text: 'Something went wrong!',
                              }).then(function() {
                                    location.reload();
                                } );
                    }
                    endOfRace();

                } else if (this.readyState == 4 && this.status != 200) {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Cannot establish connection to the server',
                    });
                    endOfRace();
                }
            }
                xmlhttpraces.open("GET", "/rest/race", true);
                xmlhttpraces.send();
        };

        function endOfRace () {
            $('#table_races_wrapper').css('display','block');
            $('#loading-window').css('display','none');
            $('#race_text').text('Start Race');
            reset();
            pause();
        }

    	// Convert time to a format of hours, minutes, seconds, and milliseconds

        function timeToString(time) {
          let diffInHrs = time / 3600000;
          let hh = Math.floor(diffInHrs);

          let diffInMin = (diffInHrs - hh) * 60;
          let mm = Math.floor(diffInMin);

          let diffInSec = (diffInMin - mm) * 60;
          let ss = Math.floor(diffInSec);

          let diffInMs = (diffInSec - ss) * 100;
          let ms = Math.floor(diffInMs);

          let formattedMM = mm.toString().padStart(2, "0");
          let formattedSS = ss.toString().padStart(2, "0");
          let formattedMS = ms.toString().padStart(2, "0");

          return `${formattedMM}:${formattedSS}:${formattedMS}`;
        }

        function print(txt) {
          document.getElementById("display").innerHTML = txt;
        }

        function startTimer() {
          startTime = Date.now() - elapsedTime;
          timerInterval = setInterval(function printTime() {
            elapsedTime = Date.now() - startTime;
            print(timeToString(elapsedTime));
          }, 10);
        }

        function pause() {
          clearInterval(timerInterval);
        }

        function reset() {
          clearInterval(timerInterval);
          print("00:00:00");
          elapsedTime = 0;
        }

        function delay(time) {
          return new Promise(resolve => setTimeout(resolve, time));
        }


});