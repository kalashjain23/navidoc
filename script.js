"use strict"
const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImthbGFzaGphaW4xMjRAZ21haWwuY29tIiwicm9sZSI6IlVzZXIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiIxMTM2NSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvdmVyc2lvbiI6IjIwMCIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGltaXQiOiI5OTk5OTk5OTkiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXAiOiJQcmVtaXVtIiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9sYW5ndWFnZSI6ImVuLWdiIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9leHBpcmF0aW9uIjoiMjA5OS0xMi0zMSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbWVtYmVyc2hpcHN0YXJ0IjoiMjAyMi0xMS0wMiIsImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hdXRoc2VydmljZS5wcmlhaWQuY2giLCJhdWQiOiJodHRwczovL2hlYWx0aHNlcnZpY2UucHJpYWlkLmNoIiwiZXhwIjoxNjY3NzAzNzAzLCJuYmYiOjE2Njc2OTY1MDN9.Igc_XuP8wTG0O79b9HccR0KdimrJbbxH5EByVDbLHVA';
let symptoms
let dictionary = []
let options = []
let diseases = []
let chances = []
let specialist = []

function geoFindMe(speciality) {
  const status = document.querySelector("#status")
  const mapLink = document.querySelector("#map-link")

  mapLink.href = ""
  mapLink.textContent = ""

  function success(position) {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    status.textContent = ""
    mapLink.href = `https://www.google.com/maps/search/${speciality}/@${latitude},${longitude},14z`
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`
  }

  function error() {
    status.textContent = "Unable to retrieve your location"
  }

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser"
  } else {
    status.textContent = "Locating…"
    navigator.geolocation.getCurrentPosition(success, error)
  }
}

function get() {
  let choices = document.getElementById("dropdown").selectedOptions
  var values = Array.from(choices).map(({value}) => value)

  let gender = document.getElementById("gender").value
  let age = document.getElementById("age").value
  let symp_para = []

  call().then((data) => {
    symptoms = data
    console.log(symptoms)

    for (let i = 0; i < 60; i++) {
      dictionary[symptoms[i].Name] = symptoms[i].ID
      options.push(symptoms[i].Name)
    }
    console.log(options)

    for (let i = 0; i < values.length; i++) {
      symp_para.push(dictionary[values[i]])
    }
    console.log(symp_para)

    diagnose(JSON.stringify(symp_para), gender, age).then((data) => {
      console.log(data)
      for (let i = 0; i < data.length; i++) {
        diseases.push(data[i].Issue.Name)
        chances.push(data[i].Issue.Accuracy)
        let gp = false
        for (let j = 0; j < data[i].Specialisation.length; j++) {
          if (
            data[i].Specialisation[j].Name != "General practice" &&
            data[i].Specialisation[j].Name != "Internal medicine"
          ) {
            specialist.push(data[i].Specialisation[j].Name)
            break
          } else if (j == data[i].Specialisation.length - 1) {
            specialist.push("General practice")
          }
        }
      }
      console.log(diseases)
      console.log(chances)
      console.log(specialist)

    //   const disease = document.getElementById("disease")
    //   const accuracy = document.getElementById("accuracy")
    //   const doctor = document.getElementById("doctor")

      const cardsContainer = document.getElementById("cards")
      const cards = []

      for (let i = 0; i < diseases.length; i++) {
        const card = document.createElement("div")
        card.classList.add("card")
        card.innerHTML = `
                <div class="card-body">
                    <h1>You have ${chances[i]}% chance of having${diseases[i]} </h1> 
                    <p>Specialist: You should consult the doctor having speciality in ${specialist[i]}</p>
                    `
        cards.push(card)
      }
      console.log(cards)

      //   cardsContainer.innerHTML = cards

      //   console.log(disease.textContent)

    })
  })
}

async function call() {
  return fetch(
    `https://sandbox-healthservice.priaid.ch/symptoms?token=${TOKEN}&language=en-gb`
  ).then(async (response) => {
    try {
      const data = await response.json()
      return data
    } catch (err) {
      console.log(err)
    }
  })
}

async function diagnose(symptoms_as_para, gender, age) {
  return fetch(
    `https://sandbox-healthservice.priaid.ch/diagnosis?symptoms=${symptoms_as_para}&gender=${gender}&year_of_birth=${age}&token=${TOKEN}&format=json&language=en-gb`
  ).then(async (response) => {
    try {
      const data = await response.json()
      return data
    } catch (err) {
      console.log(err)
    }
  })
}
