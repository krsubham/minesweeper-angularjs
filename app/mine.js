var app = angular.module('minesweeper', []);
app.controller('mineCtrl', function ($scope) {
    $scope.HEIGHT = 5;
    $scope.WIDTH = 5;
    $scope.bombsToBePlanted = 2;
    $scope.board = [];

    // Prints the cell value of the board.
    const printBoard = function () {
        for (i = 0; i < $scope.HEIGHT; ++i) {
            var tmp = '';
            for (j = 0; j < $scope.WIDTH; ++j) {
                tmp += $scope.board[i][j].faceValue + ' v:' + $scope.board[i][j].isVisible + '\t';
            }
            console.log(tmp);
        }
    };

    // Creates the basic board with any particular cell structure.
    const initBoardWithoutBombs = function () {
        for (i = 0; i < $scope.HEIGHT; ++i) {
            $scope.board[i] = [];
            for (j = 0; j < $scope.WIDTH; ++j) {
                $scope.board[i][j] = {
                    "x": j,
                    "y": i,
                    "faceValue": 0,
                    "hasBomb": false,
                    "isVisible": false,
                    "isFlagged": false
                };
            }
        }
    };

    // This adjusts the faceValue of bomb's neighbour cells.
    const adjustNearByCells = function (cell) {
        var hIndex = cell.y;
        var wIndex = cell.x;
        for (m = hIndex - 1; (m <= hIndex + 1) && (m < $scope.HEIGHT); ++m) {
            if (m < 0) continue;

            for (n = wIndex - 1; (n <= wIndex + 1) && (n < $scope.WIDTH); ++n) {
                if (n < 0) continue;
                if (!$scope.board[m][n].hasBomb) {
                    ++$scope.board[m][n].faceValue;
                }
            }
        }
    };

    // This method plants bombs on the board.
    const fillBombs = function () {
        var bombsPlanted = 0;

        while (bombsPlanted < $scope.bombsToBePlanted && bombsPlanted < ($scope.HEIGHT * $scope.WIDTH)) {
            var tmpH = Math.floor(Math.random() * $scope.HEIGHT);
            var tmpV = Math.floor(Math.random() * $scope.WIDTH);

            if (!$scope.board[tmpH][tmpV].hasBomb) {
                $scope.board[tmpH][tmpV].hasBomb = true;
                $scope.board[tmpH][tmpV].faceValue = -1;
                ++bombsPlanted;
                adjustNearByCells($scope.board[tmpH][tmpV]);
            }
        }
    };

    // This method is called, when the game is finished.
    const showAllCells = function () {
        for (i = 0; i < $scope.HEIGHT; ++i) {
            for (j = 0; j < $scope.WIDTH; ++j) {
                $scope.board[i][j].isVisible = true;
            }
        }
    };
    const validateUserClick = function (cell) {
        var showY = cell.y;
        var showX = cell.x;
        var isValidated = true;
        if ($scope.board[showY][showX].isVisible) {
            alert('The clicked cell is already visible.\n');
            isValidated = false;
        } else if ($scope.board[showY][showX].hasBomb) {
            showAllCells();
            alert('You\'ve clicked on a Bomb! You Lost!\n');
            isValidated = false;
        }
        return isValidated;
    };

    // Check whether the user has won or not.
    const validateWin = function () {
        var totalCellsFlaged = 0;
        var totalCellInvisible = 0;
        for (i = 0; i < $scope.HEIGHT; ++i) {
            for (j = 0; j < $scope.WIDTH; ++j) {
                if (!$scope.board[i][j].isVisible) {
                    ++totalCellInvisible;
                }
                if (!$scope.board[i][j].isVisible && $scope.board[i][j].isFlagged) {
                    ++totalCellsFlaged;
                }
            }
        }
        return (totalCellsFlaged === totalCellInvisible) 
                && (totalCellsFlaged === $scope.bombsToBePlanted);
    };

    // This is called when the user clicks on any cell.
    $scope.showCell = function (cell) {
        if (!validateUserClick(cell)) {
            return;
        }

        // If the cell.faceValue is not 0, then just that particular cell ONLY.
        var showX = cell.x;
        var showY = cell.y;
        if ($scope.board[showY][showX].faceValue !== 0) {
            $scope.board[showY][showX].isVisible = true;
        } else {
            var queue = [$scope.board[showY][showX]];
            while (queue.length !== 0) {
                var qEle = queue[0];
                qEle.isVisible = true;
                var xIndex = qEle.x;
                var yIndex = qEle.y;

                for (i = yIndex - 1; (i <= yIndex + 1) && (i < $scope.HEIGHT); ++i) {
                    if (i < 0) continue;
                    for (j = xIndex - 1; (j <= xIndex + 1) && (j < $scope.WIDTH); ++j) {
                        // Adding the check for board[i][j].isVisible, so that we don't end up in infinite loop.
                        if (j < 0 || $scope.board[i][j].isVisible) continue;

                        if (!$scope.board[i][j].isFlagged) {
                            $scope.board[i][j].isVisible = true;
                        }
                        if ($scope.board[i][j].faceValue === 0) {
                            queue.push($scope.board[i][j]);
                        }
                    }
                }
                // Removing the cell after it has been processed.
                queue.splice(0, 1);
            }
        }
        // Checks whether the user has won or not.
        if (validateWin()) {
            showAllCells();
            alert('User WINS!!');
        }
        printBoard();
    };

    $scope.flagTheCell = function (cell) {
        if (!cell.isVisible) {
            cell.isFlagged = !cell.isFlagged;
            if (validateWin()) {
                showAllCells();
                alert('User WINS!!');
            }
        }
    };
    
    // Creates and Initializes the board, with the user's provided configuration.
    const initBoard = function () {
        $scope.board = [];
        initBoardWithoutBombs();
        fillBombs();
        printBoard();
        console.log('****************');
        // $scope.showCell($scope.board[3][0]);
        printBoard();
    };
    // Game Starts!!
    $scope.newGame = function () {
        $scope.HEIGHT = 2;
        $scope.WIDTH = 2;
        $scope.bombsToBePlanted = 1;
    };
    $scope.startGame = function () {
        initBoard();
    };
    $scope.isGameConfigCorrect = function () {
        return ($scope.HEIGHT >= 2 && $scope.WIDTH >= 2 && $scope.bombsToBePlanted >= 1);
    }
});

app.directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, {$event: event});
            })
        })
    }
});