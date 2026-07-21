<?php
/**
 * Contact form handler for Design for Lean.
 * Accepts a JSON POST body, validates it, and emails the submission.
 * Update RECIPIENT_EMAIL below to the mailbox that should receive leads.
 */

const RECIPIENT_EMAIL = 'info@designforlean.com';
const SITE_NAME = 'Design for Lean';

header('Content-Type: application/json; charset=utf-8');

function respond(bool $success, string $message = '', int $status = 200): void {
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    respond(false, 'Could not read submission.', 400);
}

// Honeypot: bots fill hidden fields, humans never see them.
if (!empty($data['website'])) {
    respond(true); // Silently pretend success so bots don't retry.
}

$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$company = trim((string)($data['company'] ?? ''));
$program = trim((string)($data['program'] ?? 'not-sure'));
$message = trim((string)($data['message'] ?? ''));

$errors = [];
if ($name === '' || mb_strlen($name) > 120) {
    $errors[] = 'name';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    $errors[] = 'email';
}
if ($message === '' || mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    $errors[] = 'message';
}
if ($company !== '' && mb_strlen($company) > 160) {
    $errors[] = 'company';
}

$allowedPrograms = ['not-sure', 'white-belt', 'yellow-belt', 'green-belt', 'black-belt', 'team', 'consulting'];
if (!in_array($program, $allowedPrograms, true)) {
    $program = 'not-sure';
}

if (!empty($errors)) {
    respond(false, 'Please check the highlighted fields and try again.', 422);
}

$programLabels = [
    'not-sure' => 'Not sure yet',
    'white-belt' => 'White Belt',
    'yellow-belt' => 'Yellow Belt',
    'green-belt' => 'Green Belt',
    'black-belt' => 'Black Belt',
    'team' => 'Team / corporate training',
    'consulting' => 'Lean Six Sigma consulting',
];

$subject = '[' . SITE_NAME . '] New inquiry — ' . $programLabels[$program];

$bodyLines = [
    'New contact form submission',
    '',
    'Name:      ' . $name,
    'Email:     ' . $email,
    'Company:   ' . ($company !== '' ? $company : '(not provided)'),
    'Program:   ' . $programLabels[$program],
    '',
    'Message:',
    $message,
];
$body = implode("\n", $bodyLines);

$safeEmailForHeader = str_replace(["\r", "\n"], '', $email);
$safeNameForHeader = str_replace(["\r", "\n"], '', $name);

$headers = [
    'From: ' . SITE_NAME . ' <no-reply@designforlean.com>',
    'Reply-To: ' . $safeNameForHeader . ' <' . $safeEmailForHeader . '>',
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8',
];

$sent = @mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, "We couldn't send your message right now. Please email us directly at info@designforlean.com.", 502);
}

respond(true, 'Message sent.');
