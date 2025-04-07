<#
 # This script is used to manage the project.
 # It has the following actions:
 # 1. env:start: Activates the virtual environment.
 # 2. env:stop: Deactivates the virtual environment.
 # 3. app:start: Starts the React app.
 # 4. api:start: Starts the FastAPI server.
 #
 # Usage: ./manage.ps1 <action> <args>
 # Example: ./manage.ps1 env:start
#>

Param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("env:start", "env:stop", "app:start","app:start:prod", "api:start")]
    [string]$action = "api:start",
    [string]$args
)

$basePath = Split-Path -Parent $MyInvocation.MyCommand.Definition

switch($action){
    "env:start"{
        Set-Location -Path "$basePath\backend"
        if($env:VIRTUAL_ENV -eq $null){
            if($env:OS -eq "Windows_NT"){
                & '.venv\Scripts\activate.ps1'
            }else{
                bash -rcfile .venv\Scripts\activate
            }
        }
    }
    "env:stop"{
        Set-Location -Path "$basePath\backend"
        deactivate
    }
    "app:start"{
        Set-Location -Path "$basePath\sakshi-app"
        yarn start
    }
    "app:start:prod"{
        Set-Location -Path "$basePath\sakshi-app"
        yarn start:prod
    } 
    "api:start" {
        # WIP

        if($env:VIRTUAL_ENV -eq $null){
            Write-Host "ENV starting ... " -NoNewLine
            Set-Location -Path "$basePath\backend"
            
            if($env:OS -eq "Windows_NT"){
                & '.venv\Scripts\activate.ps1'
            }else{
                bash -rcfile .venv\Scripts\activate
            }
            Write-Host "Done"
        }

        Set-Location -Path "$basePath\backend\app"
        # & ../.venv/Scripts/python.exe -m uvicorn main:app --port 8000 --reload --use-colors --env-file ..\.env
        & C:\Users\saroj\Work\SAKSHI\backend\.venv\Scripts\python.exe C:\Users\saroj\Work\SAKSHI\backend\app\main.py 
    }
    default{
        Write-Host "Provide a valid action"
        exit 1
    }
}