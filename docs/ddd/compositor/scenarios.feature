Feature: Compositor

  @AC-compositor-01 @FR-01 @compositor:CT-05
  Scenario: Read a shown window
    Given Hyprland reports toplevel "0xa" of app "kitty" on workspace 3
    When the compositor translates the toplevel
    Then Window "0xa" has App Id "kitty" and Workspace Id 3
    And Window "0xa" is Shown

  @AC-compositor-02 @FR-02 @compositor:INV-01 @compositor:CT-05
  Scenario: Read a minimized window
    Given Hyprland reports toplevel "0xa" on workspace "special:minimized" with tag "omarchy-minimized-from-3"
    When the compositor translates the toplevel
    Then Window "0xa" is Minimized from Workspace Id 3

  @AC-compositor-03 @FR-02 @compositor:CT-03
  Scenario: Restore a minimized window
    Given Window "0xa" is Minimized from Workspace Id 3
    When the compositor restores "0xa" to Workspace Id 3
    Then the dispatch moves "0xa" to workspace 3, focuses it, and raises it

  @AC-compositor-04 @FR-03 @compositor:CT-01
  Scenario: Focus a shown window
    Given Window "0xa" is Shown
    When the compositor focuses "0xa"
    Then the dispatch focuses "0xa" and raises it

  @AC-compositor-05 @compositor:INV-02 @compositor:CT-01
  Scenario: Focus never acts on a minimized window
    Given Window "0xa" is Minimized from Workspace Id 3
    When the compositor focuses "0xa"
    Then no dispatch is sent

  @AC-compositor-06 @FR-04 @compositor:CT-02
  Scenario: Minimize a window through Omarchy
    Given Window "0xa" is Shown on Workspace Id 3
    When the compositor minimizes "0xa"
    Then the command is omarchy-hyprland-window-minimize "0xa"

  @AC-compositor-07 @FR-06 @compositor:CT-04
  Scenario: Close a window
    Given Window "0xa" is Shown
    When the compositor closes "0xa"
    Then the dispatch asks "0xa" to close
