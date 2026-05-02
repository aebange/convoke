# === CONFIGURATION ===
$VpsUser = "deployuser"
$VpsHost = "5.75.238.240"
$SshKey = "C:\tools\Certificates-Keys\convoke-key"
$RemoteDir = "/opt/convoke"

# === PRE-CHECK ===
if (-not (Test-Path $SshKey)) {
    Write-Error "❌ SSH key not found at $SshKey"
    exit 1
}

Write-Host "🔐 You will be prompted for your SSH key passphrase twice (upload + restart)" -ForegroundColor Yellow

# === BUILD ===
Write-Host "🛠️ Building full-stack app with Maven profile 'prod'..."
mvn clean package -Pprod -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Maven build failed"
    exit 1
}

# === FIND EXECUTABLE JAR ===
$backendTargetDir = "backend\target"
$JarPath = Get-ChildItem -Path $backendTargetDir -Filter "*.jar" | Where-Object {
    $_.Name -notmatch "sources|javadoc"
} | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $JarPath) {
    Write-Error "❌ Executable JAR not found in $backendTargetDir"
    exit 1
}

Write-Host "Found JAR: $($JarPath.FullName)"

# === DEPLOY BACKEND JAR ===
Write-Host "📦 Uploading JAR to server: $($JarPath.FullName)"
scp -i $SshKey $($JarPath.FullName) "$VpsUser@${VpsHost}:$RemoteDir/backend/app.jar"
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ SCP upload failed"
    exit 1
}

# === RESTART BACKEND SERVICE ===
Write-Host "🔁 Restarting backend service via SSH..."
ssh -i $SshKey "$VpsUser@$VpsHost" "sudo systemctl restart myapp-backend"
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to restart service"
    exit 1
}

Write-Host "`n✅ Deployment complete." -ForegroundColor Green
