# Hypermedia Project 2

In this project we have made a recreation of the game Rush Hour.

## Implementation

To implement this game we have defined some global variables such as the game state and dragging state.

We firstly create a board, given an ID, we populate the DIV with rows and cells.
We then draw the cars on the board and add their dragging functionality.
To prevent a car from going over another car we see if between the start position and the target position of the car there is another car, if we find it we cap the movement to stop when it reaches the car.

We also have introduced some variables in the loadGame function to be able to show the initial board without being able to drag cars. This is useful to showcase levels in the main menu for the user to gauge the difficulty of the level without needing to enter it.
