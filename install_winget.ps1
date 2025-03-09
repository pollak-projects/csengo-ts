#function IsUserAdmin ([boolean]$ShowAllProperties = $false) {
#	# Get the current logged on user
#	$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
#	if($ShowAllProperties){
#		$currentUser | Select-Object *
#		return
#	}
#
#	# Create a principal object for the current user
#	$userPrincipal = New-Object System.Security.Principal.WindowsPrincipal($currentUser)
#
#	# Check if the user is in the Administrators group
#	if ($userPrincipal.IsInRole(
#			[System.Security.Principal.WindowsBuiltInRole]::Administrator)
#	) {
#		return $true
#	} else {
#		return $false
#	}
#}
#
#
#if (-not (IsUserAdmin))
#{
#    $params = @{
#        FilePath = 'powershell' # or pwsh if Core
#        Verb = 'RunAs'
#        ArgumentList = @(
#            '-NoExit',
#            '-ExecutionPolicy ByPass'
#            '-File "{0}"' -f  $PSCommandPath
#        )
#    }
#
#    Start-Process @params
#    Write-Host "Running as admin... "
#}

## Test if winget command can run from CMD/PS, if it can't, install prerequisites (if needed) and update to latest version
try
{
    winget --version
    Write-host "Winget command present"

    Write-Host "Downloading and installing ffmpeg and yt-dlp..."
    winget install -e --id ffmpeg
    winget install -e --id yt-dlp.yt-dlp
    Write-Host "ffmpeg and yt-dlp installed successfully."

    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

	Read-Host -Prompt "Press Enter to continue..."
    Exit(0)
}
catch
{
    Read-Host -Prompt "Press Enter to continue... winget not found"
    Write-Host "Checking prerequisites and updating winget..."

    ## Test if Microsoft.UI.Xaml.2.7 is present, if not then install
    try
    {
        $package = Get-AppxPackage -Name "Microsoft.UI.Xaml.2.7"
        if ($package)
        {
            Write-Host "Microsoft.UI.Xaml.2.7 is installed."
        }
        else
        {
            Write-Host "Installing Microsoft.UI.Xaml.2.7..."
            Invoke-WebRequest `
			-URI https://www.nuget.org/api/v2/package/Microsoft.UI.Xaml/2.7.3 `
			-OutFile xaml.zip -UseBasicParsing
            New-Item -ItemType Directory -Path xaml
            Expand-Archive -Path xaml.zip -DestinationPath xaml
            Add-AppxPackage -Path "xaml\tools\AppX\x64\Release\Microsoft.UI.Xaml.2.7.appx"
            Remove-Item xaml.zip
            Remove-Item xaml -Recurse
        }
    }
    catch
    {
        Write-Host "An error occurred: $( $_.Exception.Message )"
    }

    ## Update Microsoft.VCLibs.140.00.UWPDesktop
    Write-Host "Updating Microsoft.VCLibs.140.00.UWPDesktop..."
    if (-Not (Test-Path "UWPDesktop.appx"))
    {
        Invoke-WebRequest `
			-URI https://aka.ms/Microsoft.VCLibs.x64.14.00.Desktop.appx `
			-OutFile UWPDesktop.appx -UseBasicParsing
    }
    Add-AppxPackage UWPDesktop.appx

    ## Install latest version of Winget
    Write-Host "Installing latest version of winget..."
    $API_URL = "https://api.github.com/repos/microsoft/winget-cli/releases/latest"
    $DOWNLOAD_URL = $( Invoke-RestMethod $API_URL ).assets.browser_download_url |
            Where-Object { $_.EndsWith(".msixbundle") }
    if (-Not (Test-Path "winget.msixbundle"))
    {
        Invoke-WebRequest -URI $DOWNLOAD_URL -OutFile winget.msixbundle -UseBasicParsing
    }
    Add-AppxPackage winget.msixbundle

    ## Define variables for winget installer
    $winget_installer_url = "https://github.com/microsoft/winget-cli/releases/download/v1.10.340/Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
    $winget_installer_path = "./Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"

    Write-Host "Installing latest version of winget..."
    if (-Not (Test-Path $winget_installer_path))
    {
        Write-Host "Downloading winget installer..."
        Invoke-WebRequest -URI $winget_installer_url -OutFile $winget_installer_path -UseBasicParsing
    }
    else
    {
        Write-Host "Installer already exists."
    }
    Add-AppxPackage -Path $winget_installer_path

    Write-Host "Winget installed successfully."

    ## Install ffmpeg and yt-dlp using winget

    Write-Host "Downloading and installing ffmpeg and yt-dlp..."
    winget install -e --id ffmpeg
    winget install -e --id yt-dlp.yt-dlp
    Write-Host "ffmpeg and yt-dlp installed successfully."

    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Read-Host -Prompt "Press Enter to continue..."
    Exit(0)
}

