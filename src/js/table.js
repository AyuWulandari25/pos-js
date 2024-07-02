let tBodyHtml = document.querySelector(".tbody")
let tBodyModalHtml = document.querySelector(".tbody-modal")
let order_list = []

$(document).ready(function() {
    $('#dataTable').DataTable();
  });

$('#table').DataTable().columns(1).search("").draw();

function addDataToTable () {
  tBodyHtml.innerHTML = ''
  if(order_list.length > 0){
    order_list.forEach(element => {
      let dataInsert = document.createElement('tr')
      dataInsert.classList.add(`${element['id'].toString()}`)
      element['total_item'] = 0
      element['total_item'] = element['total_item'] + element['list_order'].length
      dataInsert.innerHTML = `<td>${new Date(element['created_time']).toLocaleDateString('en-GB')}</td>
                              <td>Rp. ${element['total_payment']}</td>
                              <td>${element['total_item']}</td>
                              <td><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#staticBackdrop" onclick="openModalDetail(${element['id']})">Detail</button></td>`
      tBodyHtml.appendChild(dataInsert)
    });
  }
}

function openModalDetail(data){
  tBodyModalHtml.innerHTML = ''
  fetch(`https://pos-wcdo.onrender.com/order_report/${data}`)
      .then(response => response.json())
      .then(data => {
        data['list_order'].forEach((list) => {
        let dataInsert = document.createElement('tr')
        dataInsert.innerHTML = `<td>${list['title_menu']}</td>
                                <td>Rp. ${list['price']}</td>
                                <td>${list['quantity']}</td>`

        tBodyModalHtml.appendChild(dataInsert)
      })

  })
}


function fetchDataToTable () {
  fetch('https://pos-wcdo.onrender.com/order_report')
      .then(response => response.json())
      .then(data => {
        order_list = data;
        addDataToTable();
      })
}
fetchDataToTable();