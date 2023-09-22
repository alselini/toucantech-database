$(document).ready(function () {
  populateStudentList();
  updateDropdowns();
});

// Populates the student list
function populateStudentList() {
  $("#studentsTbody").empty();

  $.ajax({
    url: "libs/php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      data.data.forEach(function (student) {
        $("#studentsTbody").append(`
          <tr>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.schoolNames}</td>
            <td>
              <button class="btn btn-secondary btn-edit" data-id="${student.id}">Edit</button>
              <button class="btn btn-danger btn-delete" data-id="delete${student.id}">Delete</button>
            </td>
          </tr>
        `);
      });

      // card layout when the display is smaller
      $("#container2").empty();
      $.ajax({
        url: "libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
          data.data.forEach(function (student) {
            $("#container2").append(`
          <div class="card">
            <h4 class="card-title">
              <button class="btn" data-toggle="collapse" data-target="#student-${student.id}">
                ${student.firstName} ${student.lastName} <i class="fas fa-plus"></i>
              </button>
            </h4>
            <div id="student-${student.id}" class="collapse">
            <p class="card-text">I.D: ${student.id}</p>
              <p class="card-text">Email: ${student.email}</p>
              <p class="card-text">School: ${student.schoolNames}</p>
              <button class="btn btn-secondary btn-edit" data-id="${student.id}">Edit</button>
              <button class="btn btn-danger btn-delete" data-id="delete${student.id}">Delete</button>
            </div>
          </div>
        `);
          });

          // toggle visibility of the details when clicked
          $(".btn").click(function () {
            var target = $(this).data("target");
            $(target).collapse("toggle");
          });

          // establishes which student is being edited and triggers function
          $(".btn-edit").on("click", function () {
            let id = $(this).data("id");
            editClick(id);
          });

          // establishes which student is being deleted and triggers function
          $(".btn-delete").on("click", function () {
            let id2 = $(this).data("id").replace("delete", "");
            deleteStudent(id2);
          });
        },
      });
    },
  });
}

// retrieves values of inputs and adds the new student
$("#addStudentForm").on("submit", function (e) {
  e.preventDefault();
  var firstName = $("#firstNameInput").val();
  var lastName = $("#lastNameInput").val();
  var email = $("#emailInput").val();

  // Gather all selected school IDs into an array
  var selectedSchoolIDs = [];
  $(".schoolCheckbox:checked").each(function () {
    selectedSchoolIDs.push($(this).val());
  });

  $.ajax({
    url: "libs/php/addStudent.php",
    type: "POST",
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      schoolIDs: selectedSchoolIDs,
    },
    success: function (data) {
      $("#addModal").modal("hide");
      $.toast({
        text: "Student added successfully!",
        showHideTransition: "slide",
        position: "top-right",
        icon: "success",
      });
      populateStudentList();
      $("#addStudentForm")[0].reset();

      // Uncheck all checkboxes
      $(".schoolCheckbox").prop("checked", false);
    },
  });
});

function deleteStudent(id2) {
  if (confirm("Are you sure you want to delete this student?")) {
    $.ajax({
      url: `libs/php/deleteStudent.php`,
      type: "POST",
      data: { id: id2 },
      dataType: "json",
      success: function (response) {
        if (response.status.code == "200") {
          // Show success toast notification
          $.toast({
            heading: "Success",
            text: "Student deleted successfully",
            showHideTransition: "slide",
            icon: "success",
            position: "top-right",
          });
          // Refreshes the student list
          populateStudentList();
        } else {
          // Show error toast notification
          $.toast({
            heading: "Error",
            text: "Failed to delete student",
            showHideTransition: "slide",
            icon: "error",
            position: "top-right",
          });
        }
      },
    });
  }
}

//function to edit existing student
function editClick(id) {
  // Fetch the details of the student with the corresponding id
  $.ajax({
    url: "libs/php/getStudentByID.php",
    type: "GET",
    data: { id: id },
    dataType: "json",
    success: function (response) {
      // Populates the form fields with the student details
      id = response.data.student[0].id;
      firstName = response.data.student[0].firstName;
      lastName = response.data.student[0].lastName;
      email = response.data.student[0].email;

      // Set the pre associated schools
      const selectedSchools = response.data.associatedSchools.map(
        (school) => school.id
      );
      $(".schoolCheckbox2").prop("checked", false); // Uncheck all checkboxes
      selectedSchools.forEach(function (schoolID) {
        $("#school_" + schoolID + "_2").prop("checked", true); // Check the pre associated schools
      });

      $("#editForm").data("id", id);
      $("#editFirstName").val(firstName);
      $("#editLastName").val(lastName);
      $("#editEmail").val(email);

      $("#editModal").modal("show");
    },
  });
}

//submit the form to update the student details
$("#editForm").on("submit", function (e) {
  e.preventDefault();

  //get the updated values from the form
  var id = $(this).data("id");
  var updatedFirstName = $("#editFirstName").val();
  var updatedLastName = $("#editLastName").val();
  var updatedEmail = $("#editEmail").val();
  // Collect the checked checkboxes' values
  var updatedSchoolIDs = [];
  $(".schoolCheckbox2:checked").each(function () {
    updatedSchoolIDs.push($(this).val());
  });

  $.ajax({
    url: "libs/php/editStudent.php",
    method: "POST",
    data: {
      firstName: updatedFirstName,
      lastName: updatedLastName,
      email: updatedEmail,
      schoolIDs: updatedSchoolIDs,
      id: id,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.description === "success") {
        //hide the modal
        $("#editModal").modal("hide");
        //show success message with $.toast
        $.toast({
          heading: "Success",
          text: "Student details updated successfully!",
          showHideTransition: "slide",
          position: "top-right",
          icon: "success",
        });
        //reload the page to show updated details
        populateStudentList();
      } else {
        //show error message with $.toast
        $.toast({
          heading: "Error",
          text: response,
          showHideTransition: "slide",
          icon: "error",
        });
      }
    },
  });
});

// Toggle the dropdown using jQuery
$(".dropbtn").click(function () {
  $("#addSchoolSelect").toggleClass("show");
});
// Toggle the dropdown using jQuery
$(".dropbtn").click(function () {
  $("#editSchoolSelect").toggleClass("show");
});

// Close the dropdown if the user clicks outside of it
$(window).click(function (event) {
  if (!$(event.target).closest(".dropdown").length) {
    $(".dropdown-content").removeClass("show");
  }
});

//populates the school dropdowns
function updateDropdowns() {
  $.ajax({
    url: "libs/php/getAllSchools.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#schoolSearch").empty();
      $("#schoolSearch").prepend(
        $("<option>", {
          selected: "selected",
          value: "",
          text: "All Schools",
        })
      );
      data.data.forEach(function (schools) {
        //Add schools to the select element
        $("#schoolSearch").append(
          $("<option>", {
            value: schools.name,
            text: schools.name,
          })
        );
      });
    },
  });

  $.ajax({
    url: "libs/php/getAllSchools.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#addSchoolSelect").empty();
      $.each(data.data, function (index, school) {
        let checkbox = $("<input>", {
          type: "checkbox",
          value: school.id,
          id: "school_" + school.id,
          class: "schoolCheckbox",
        });
        let label = $("<label>", {
          for: "school_" + school.id,
        })
          .append(checkbox)
          .append(school.name);

        $("#addSchoolSelect").append(label);
      });
    },
  });

  $.ajax({
    url: "libs/php/getAllSchools.php",
    type: "GET",
    dataType: "json",
    success: function (data) {
      $("#editSchoolSelect").empty();
      $.each(data.data, function (index, school) {
        let uniqueId = "school_" + school.id + "_2";
        let checkbox = $("<input>", {
          type: "checkbox",
          value: school.id,
          id: uniqueId,
          class: "schoolCheckbox2",
        });
        let label = $("<label>", {
          for: uniqueId,
        })
          .append(checkbox)
          .append(school.name);

        $("#editSchoolSelect").append(label);
      });
    },
  });
}

// filtering when keys are pressed
const table = document.querySelector(".table");
if (table.classList.contains("d-none")) {
  $(document).ready(function () {
    $("#nameSearch").on("keyup", function () {
      var nameValue = $(this).val().toLowerCase();
      var schoolValue = $("#schoolSearch").val().toLowerCase();

      if (nameValue.length > 0 || schoolValue.length > 0) {
        $("tbody tr").each(function () {
          var name = $(this).find("td:nth-child(1)").text().toLowerCase();
          var id = $(this).find("td:nth-child(2)").text();
          var school = $(this).find("td:nth-child(5)").text().toLowerCase();

          if (
            (name.indexOf(nameValue) === -1 && id.indexOf(nameValue) === -1) ||
            school.indexOf(schoolValue) === -1
          ) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      } else {
        $("tbody tr").show();
      }
    });

    // filtering when a school is selected
    $("#schoolSearch").on("change", function () {
      var nameValue = $("#nameSearch").val().toLowerCase();
      var schoolValue = $(this).val().toLowerCase();

      if (nameValue.length > 0 || schoolValue.length > 0) {
        $("tbody tr").each(function () {
          var name = $(this).find("td:nth-child(1)").text().toLowerCase();
          var id = $(this).find("td:nth-child(2)").text();
          var school = $(this).find("td:nth-child(3)").text().toLowerCase();

          if (
            (name.indexOf(nameValue) === -1 && id.indexOf(nameValue) === -1) ||
            school.indexOf(schoolValue) === -1
          ) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      } else {
        $("tbody tr").show();
      }
    });
  });
}

//filtering when viewport is small (mobile)
if (window.matchMedia("(max-width: 992px)").matches) {
  $(document).ready(function () {
    $("#nameSearch").on("keyup", function () {
      var nameValue = $(this).val().toLowerCase();
      var schoolValue = $("#schoolSearch").val().toLowerCase();

      $(".card").each(function () {
        var name = $(this).find("h4").text().toLowerCase();
        var id = $(this).find("p:nth-child(1)").text();
        var school = $(this).find("p:nth-child(3)").text().toLowerCase();

        if (
          (name.indexOf(nameValue) === -1 && id.indexOf(nameValue) === -1) ||
          school.indexOf(schoolValue) === -1
        ) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    });

    $("#schoolSearch").on("change", function () {
      var nameValue = $("#nameSearch").val().toLowerCase();
      var schoolValue = $(this).val().toLowerCase();

      $(".card").each(function () {
        var name = $(this).find("h4").text().toLowerCase();
        var school = $(this).find("p:nth-child(3)").text().toLowerCase();

        if (
          name.indexOf(nameValue) === -1 ||
          school.indexOf(schoolValue) === -1
        ) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    });
  });
}
