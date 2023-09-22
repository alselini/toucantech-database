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

$query = $conn->prepare('SELECT `id`, `firstName`, `lastName`, `email` FROM `students` WHERE `id` = ?');

$query->bind_param("i", $_GET['id']);
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

$result = $query->get_result();
$students = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($students, $row);
}

// Query to get schools associated with a student using the student_schools table
$schools_query = $conn->prepare('SELECT s.id, s.name 
                                 FROM schools s
                                 INNER JOIN student_schools ss ON s.id = ss.school_id 
                                 WHERE ss.student_id = ?');

$schools_query->bind_param("i", $_GET['id']);
$schools_query->execute();

$schools_result = $schools_query->get_result();

$associated_schools = [];

while ($row = mysqli_fetch_assoc($schools_result)) {
    array_push($associated_schools, $row);
}

// Query to get all schools for the dropdowns
$query = 'SELECT id, name FROM schools ORDER BY name';

$result = $conn->query($query);

if (!$result) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";   
    $output['data'] = [];

    mysqli_close($conn);
    echo json_encode($output); 
    exit;
}

$schools = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($schools, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['student'] = $students;
$output['data']['associatedSchools'] = $associated_schools; // Schools associated with the student
$output['data']['allSchools'] = $schools;  // All schools 

mysqli_close($conn);
echo json_encode($output); 

?>
