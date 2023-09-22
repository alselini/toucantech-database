<?php

$executionStartTime = microtime(true);

include("../../config.php");
header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);
    exit;
}

// Prepare the SQL statement to update student's information
$updateStudentQuery = $conn->prepare("UPDATE students SET id = ?, firstName = ?, lastName = ?, email = ? WHERE id = ?");
$updateStudentQuery->bind_param("isssi", $_POST['id'], $_POST['firstName'], $_POST['lastName'], $_POST['email'], $_POST['id']);
$updateStudentQuery->execute();

// Delete all existing associations for the student
$deleteAssociationsQuery = $conn->prepare("DELETE FROM student_schools WHERE student_id = ?");
$deleteAssociationsQuery->bind_param("i", $_POST['id']);
$deleteAssociationsQuery->execute();

// Insert associations for the selected schools
$insertAssociationsQuery = $conn->prepare("INSERT INTO student_schools (student_id, school_id) VALUES (?, ?)");
$insertAssociationsQuery->bind_param("ii", $_POST['id'], $schoolID);

if (isset($_POST['schoolIDs']) && is_array($_POST['schoolIDs'])) {
    foreach ($_POST['schoolIDs'] as $schoolID) {
        $insertAssociationsQuery->execute();
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

mysqli_close($conn);

echo json_encode($output);

?>
