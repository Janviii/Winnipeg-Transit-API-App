const apiKey = 'G3JMEOoD1GWm5-XzlN0i';
const form = document.querySelector('form');
const searchInput = form.querySelector('input');
const streetList = document.querySelector('.streets');
const busList = document.querySelector('tbody');

form.addEventListener('keypress', function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();             
    getStreetList(searchInput.value);
  }
});

function searchStreet(name) {
  return fetch(
    `https://api.winnipegtransit.com/v3/streets.json?api-key=${apiKey}&name=${name}&usage=long`
  )
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error('Stop not found');
      }
    })
    .then((data) => data.streets);
}

function getStreetList(name) {
  let html = '';
  streetList.innerHTML = '';

  searchStreet(name)
  .then((streetArr) => {
    if (streetArr.length !== 0) {
      streetArr.forEach((element) => {
        html += `<a href="#" data-street-key="${element.key}">${element.name}</a>`;
      });
    } else {
      html = 'Stop not found';
    }
    streetList.insertAdjacentHTML('beforeend', html);
  });
}

function getSchedulePage(streetKey) {
  let html = '';
  busList.innerHTML = '';

  getScheduleArr(streetKey).then((scheduleArray) => {
    for (const schedule of scheduleArray) {
      for (const routeSchedule of schedule[`route-schedules`]) {
        html += ` <tr>
                      <td>${schedule.stop.street.name}</td>
                      <td>${schedule.stop[`cross-street`].name}</td>
                      <td>${schedule.stop.direction}</td>
                      <td>${routeSchedule.route.number}</td>
                      <td>${timeFormatter(
                        routeSchedule[`scheduled-stops`][0].times.departure
                          .estimated
                      )}</td>
                    </tr>`;
      }
    }

    busList.insertAdjacentHTML('beforeend', html);
  });
}

function getStreetNameResult(streetName) {
    const streetNameElement = document.querySelector('#street-name');
    streetNameElement.textContent = '';
    streetNameElement.textContent = `Displaying results for ${streetName}`;
}
  

function getScheduleArr(streetKey) {
  return gstStopNamesInStreet(streetKey).then((stopArr) => {
    const jsonPromise = [];
    const stopKeyArr = stopArr.map((ele) => ele.key);

    for (let stop of stopKeyArr) {
      jsonPromise.push(
        fetch(
          `https://api.winnipegtransit.com/v3/stops/${stop}/schedule.json?api-key=${apiKey}&max-results-per-route=2`
        )
          .then((resp) => {
            if (resp.ok) {
              return resp.json();
            } else {
              throw new Error('Stop not found');
            }
          })
          .then((json) => json[`stop-schedule`])
      );
    }

    return Promise.all(jsonPromise);
  });
}

function gstStopNamesInStreet(streetKey) {
  return fetch(
    `https://api.winnipegtransit.com/v3/stops.json?street=${streetKey}&api-key=${apiKey}`
  )
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error('Stop not found');
      }
    })
    .then((data) => data.stops);
}

streetList.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      getStreetNameResult(e.target.textContent);
      getSchedulePage(e.target.dataset.streetKey);
    }
});

function timeFormatter(timeString) {
    return new Date(timeString).toLocaleTimeString(`en-US`, {
      timeZone: 'Canada/Central',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    });
  }