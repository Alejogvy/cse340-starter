'use strict'

let classificationList = document.querySelector("#classificationList")

classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value
  console.log(`classification_id is: ${classification_id}`)

  let classIdURL = "/inv/getInventory/" + classification_id

  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json()
      }
      throw Error("Network response was not OK")
    })
    .then(function (data) {
      console.log(data)
      buildInventoryList(data)
    })
    .catch(function (error) {
      console.log('There was a problem: ', error.message)
    })
})

/**********************************************************
 * Receives the list of vehicles and builds the HTML table
 ******************************************************** */
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay")

  let tableHead = `
    <thead>
      <tr>
        <th>Vehicle Name</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
  `
  let tableBody = "<tbody>"
  data.forEach(function (vehicle) {
    tableBody += `
      <tr>
        <td>${vehicle.inv_make} ${vehicle.inv_model}</td>
        <td>
          <a href='/inv/edit/${vehicle.inv_id}' title='Click to update'>Modify</a> 
          | 
          <a href='/inv/delete/${vehicle.inv_id}' title='Click to delete'>Delete</a>
        </td>
      </tr>
    `
  })
  tableBody += "</tbody>"

  inventoryDisplay.innerHTML = tableHead + tableBody
};
