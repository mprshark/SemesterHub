<?php

class AnalyticsHandler {
    private $dbPath;
    private $encryptionKey;
    
    public function __construct() {
        $this->dbPath = __DIR__ . '/data/';
        if (!file_exists($this->dbPath)) {
            mkdir($this->dbPath, 0700, true);
        }
        $this->encryptionKey = defined('ENC_KEY') ? ENC_KEY : 
                               file_get_contents(__DIR__ . '/encryption.key');
    }
    
    public function handle() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['profile'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }
        
        $clientIP = $this->getClientIP();
        $geoData = $this->geoLocateIP($clientIP);
        
        $record = [
            'profile' => $input['profile'],
            'server_data' => [
                'ip' => $clientIP,
                'geo' => $geoData,
                'timestamp' => round(microtime(true) * 1000),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                'accept_language' => $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '',
                'headers' => getallheaders()
            ],
            'device_id' => $input['deviceId'] ?? null,
            'session_id' => $input['sessionId'] ?? session_id(),
            'first_seen' => time(),
            'last_seen' => time()
        ];
        
        $storeKey = $input['deviceId'] ?? $input['sessionId'] ?? session_id();
        $filePath = $this->dbPath . preg_replace('/[^a-zA-Z0-9_-]/', '_', $storeKey) . '.json';
        
        if (file_exists($filePath)) {
            $existing = json_decode(file_get_contents($filePath), true);
            $existing['last_seen'] = time();
            $existing['visits'] = ($existing['visits'] ?? 0) + 1;
            $existing['profiles'][] = $record;
            file_put_contents($filePath, json_encode($existing, JSON_PRETTY_PRINT));
        } else {
            $record['visits'] = 1;
            $record['profiles'] = [$record];
            file_put_contents($filePath, json_encode($record, JSON_PRETTY_PRINT));
        }
        
        $newDeviceId = $input['deviceId'] ?? bin2hex(random_bytes(16));
        echo json_encode([
            'status' => 'ok',
            'deviceId' => $newDeviceId,
            'sessionId' => $input['sessionId'] ?? session_id(),
            'known' => !empty($input['deviceId'])
        ]);
    }
    
    private function getClientIP() {
        $headers = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        foreach ($headers as $h) {
            if (!empty($_SERVER[$h])) {
                $ip = explode(',', $_SERVER[$h])[0];
                if (filter_var(trim($ip), FILTER_VALIDATE_IP)) {
                    return trim($ip);
                }
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    
    private function geoLocateIP($ip) {
        if ($ip === '127.0.0.1' || $ip === '::1' || 
            strpos($ip, '192.168.') === 0 || strpos($ip, '10.') === 0) {
            return ['type' => 'private', 'ip' => $ip];
        }
        
        $apiUrl = "http://ip-api.com/json/{$ip}";
        $response = @file_get_contents($apiUrl);
        
        if ($response) {
            $data = json_decode($response, true);
            return [
                'ip' => $ip,
                'country' => $data['country'] ?? null,
                'countryCode' => $data['countryCode'] ?? null,
                'region' => $data['region'] ?? null,
                'regionName' => $data['regionName'] ?? null,
                'city' => $data['city'] ?? null,
                'zip' => $data['zip'] ?? null,
                'lat' => $data['lat'] ?? null,
                'lon' => $data['lon'] ?? null,
                'timezone' => $data['timezone'] ?? null,
                'isp' => $data['isp'] ?? null,
                'org' => $data['org'] ?? null,
                'as' => $data['as'] ?? null
            ];
        }
        
        return ['ip' => $ip, 'error' => 'Geo lookup failed'];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/api/analytics') {
    header('Content-Type: application/json');
    $handler = new AnalyticsHandler();
    $handler->handle();
    exit;
}
?>