const baseurl = "https://sheetdb.io/api/v1/zbwq21blw43db";
const membersurl = baseurl + "?sheet=member";
const eventsurl = baseurl + "?sheet=event";
const attendanceurl = baseurl + "?sheet=attendance";

let eventcount = 0;
let membercount = 0;
let availableevent;

function CheckGeoLocation() {
    if (!navigator.geolocation) {
        document.getElementById('submitbutton').style.display = 'none';
        document.getElementById('locationdetails').innerText = 'Location Not Enabled on Device';
        document.getElementById('locationdetails').className += ' text-danger'
    }
}

function LoadEventData() {
    fetch(eventsurl).then((resp) => {
        return resp.json();
    }).then((data) => {
        //console.log(data)
        return data.filter((e) => {
            var eventdate = new Date(e.Date);
            var today = new Date();
            if (eventdate.getDate() == today.getDate() && eventdate.getMonth() == today.getMonth() && eventdate.getYear() == today.getYear()) {
                return e;
            }
        })
    }).then((data) => {
        //console.log(data)
        data.sort((a, b) => {
            return b.ID - a.ID;
        });
        availableevent = data;
        data.map((i) => {
            let elem = document.createElement('option');
            elem.value = i.ID + '| ' + i.Name;
            elem.text = `${i.Name}`;
            elem.setAttribute('data-Id', i.ID)
            elem.setAttribute('data-lat', i.VenueLat)
            elem.setAttribute('data-long', i.VenueLong)
            document.getElementById('eventdatalist').append(elem);
            eventcount = data.length;
        })
    }).catch((err) => {
        console.log(err);
    })
}

function LoadMemberData() {
    fetch(membersurl).then((resp) => {
        return resp.json();
    }).then((data) => {
        //console.log(data)
        data.sort((a, b) => {
            return a.FullName - b.FullName;
        });
        data.map((i) => {
            let elem = document.createElement('option');
            elem.value = i.ID + '| ' + i.FullName;
            elem.text = `(${i.NickName})`;
            elem.setAttribute('data-Id', i.ID)
                //elem.setAttribute('data-lat', i.VenueLat)
                //elem.setAttribute('data-long', i.VenueLong)
            document.getElementById('memberdatalist').append(elem);
            membercount = data.length;
        })
    }).catch((err) => {
        console.log(err);
    })
}

function LoadData() {
    CheckGeoLocation();
    LoadEventData();
    LoadMemberData();
}

function SubmitForm(e) {
    let dt = new FormData(e);
    let mID = dt.get('membersearch').split('|')[0];
    let eID = dt.get('eventsearch').split('|')[0];

    console.log('all', availableevent);
    let thisEv = availableevent.filter((e) => {
        if (e.ID == eID) {
            return e;
        };
    });

    let btn = document.getElementById('submitbutton');
    btn.value = 'Checking In...';
    btn.disabled = true;
    let result = document.getElementById('locationdetails');

    // var lblat = document.getElementById('latlabel');
    // var lblong = document.getElementById('latlabel');

    // Get User Location
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        let geolocation = {
            'lat': latitude,
            'long': longitude
        }
        console.log('geolocation', geolocation);

        console.log('this ev', thisEv);

        //Check if user is in venue
        let latdiff = Math.abs(parseFloat(thisEv[0].VenueLat) - geolocation.lat) / parseFloat(thisEv[0].VenueLat) * 100;
        let longdiff = Math.abs(parseFloat(thisEv[0].VenueLong) - geolocation.long) / parseFloat(thisEv[0].VenueLong) * 100;
        console.log(latdiff, longdiff);
        let isPresent = latdiff <= 0.01 && longdiff <= 0.012 ? 1 : 0;

        let request = {
            "MemberID": mID,
            "EventID": eID,
            "IsPresent": isPresent,
            "TimeIn": new Date().toLocaleTimeString().substring(0, 8),
            "IPAddress": "",
            "LocationLat": geolocation.lat,
            "LocationLong": geolocation.long,
            "IsVenue": isPresent

        }
        console.log(JSON.stringify(request));

        fetch('https://test.com', {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(request)
        }).then((resp) => {
            //result.innerText = 'Successfully Checked In';
            //result.className += ' text-success' 
            alert('Successfully Checked In')
            console.log(resp.json());
        }).catch((err) => {
            alert('Test Preview Successful');
            console.log(err);
        }).then(() => {
            btn.disabled = false;
            btn.value = 'Check In';
        })
    }, (err) => {
        alert('Location Not Enabled on Device !')
        btn.disabled = false;
        btn.value = 'Check In';
        console.log(err);
    })

    console.log('');
}
