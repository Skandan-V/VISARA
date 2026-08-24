; ==============================================================================
; Visara - Advanced NSIS Installer Customization Script
; Repository: https://github.com/Skandan-V/VISARA
; Author: Skandan V (Hyperdyn)
; License: MIT
; ==============================================================================

!macro customHeader
  !system "echo Customizing Visara Installer..."
!macroend

!macro customInit
  ; Ensure only one installer instance runs at a time
  BringToFront
!macroend

!macro customInstall
  ; Register App User Model ID for Windows Taskbar Grouping & Toast Notifications
  WriteRegStr HKCU "Software\Classes\AppUserModelId\Hyperdyn.VISARA" "DisplayName" "Visara"
  WriteRegStr HKCU "Software\Classes\AppUserModelId\Hyperdyn.VISARA" "IconUri" "$INSTDIR\resources\assets\icon.ico"

  ; Create Application Protocol Handler (Optional visara:// schema)
  WriteRegStr HKCU "Software\Classes\visara" "" "URL:Visara Protocol"
  WriteRegStr HKCU "Software\Classes\visara" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\visara\DefaultIcon" "" "$INSTDIR\Visara.exe,0"
  WriteRegStr HKCU "Software\Classes\visara\shell\open\command" "" '"$INSTDIR\Visara.exe" "%1"'
!macroend

!macro customUnInstall
  ; Clean up App User Model ID & Protocol registry keys on uninstall
  DeleteRegKey HKCU "Software\Classes\AppUserModelId\Hyperdyn.VISARA"
  DeleteRegKey HKCU "Software\Classes\visara"
!macroend
