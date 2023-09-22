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

// Insert the student into the `students` table
$query = $conn->prepare("INSERT INTO students (firstName, lastName, email) VALUES (?, ?, ?)");
$query->bind_param("sss", $_POST['firstName'], $_POST['lastName'], $_POST['email']);

$query->execute();

if (false === $query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";	
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output); 
    exit;
}

// Get the last inserted student's ID
$studentID = $conn->insert_id;

// Loop through the school IDs and insert each into `student_schools` table
$schoolIDs = $_POST['schoolIDs'];
foreach($schoolIDs as $schoolID) {
    $query = $conn->prepare("INSERT INTO student_schools (student_id, school_id) VALUES (?, ?)");
    $query->bind_param("ii", $studentID, $schoolID);
    $query->execute();
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

mysqli_close($conn);

echo json_encode($output); 

?>
