Feature: Taskbar

  @AC-taskbar-01 @FR-01 @taskbar:INV-01 @taskbar:CT-02
  Scenario: Show only the apps of the active workspace
    Given Window "0xa" of "kitty" is Shown on Workspace Id 3
    And Window "0xb" of "zen" is Shown on Workspace Id 4
    And Window "0xc" of "kitty" is Minimized from Workspace Id 3
    And Window "0xd" of "obsidian" is Minimized from Workspace Id 4
    When the taskbar builds Workspace Apps for Workspace Id 3
    Then Workspace Apps is one App Group "kitty" with Windows "0xa" and "0xc"

  @AC-taskbar-02 @FR-05 @taskbar:INV-02 @taskbar:CT-03
  Scenario: A click on an app with several windows asks to choose
    Given App Group "kitty" has Windows "0xa" and "0xc"
    When the user clicks App Group "kitty"
    Then the Click Intent is choose

  @AC-taskbar-03 @FR-04 @taskbar:CT-03
  Scenario: A click on the focused window minimizes it
    Given App Group "zen" has one Shown Window "0xb"
    And Window "0xb" has the focus
    When the user clicks App Group "zen"
    Then the Click Intent is minimize "0xb"

  @AC-taskbar-04 @FR-02 @taskbar:CT-03
  Scenario: A click on a minimized window restores it
    Given App Group "obsidian" has one Window "0xd" Minimized from Workspace Id 3
    When the user clicks App Group "obsidian"
    Then the Click Intent is restore "0xd"

  @AC-taskbar-05 @FR-03 @taskbar:CT-03
  Scenario: A click on a window without focus focuses it
    Given App Group "zen" has one Shown Window "0xb"
    And Window "0xa" has the focus
    When the user clicks App Group "zen"
    Then the Click Intent is focus "0xb"
