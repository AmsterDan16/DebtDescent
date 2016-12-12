app.controller('DebtController', ['$scope', function($scope){
    $scope.monthlyPayment = 0;
    $scope.numberOfMonthsTilPayoff = 0;
    $scope.CreateAmoritizationSchedule = function(loanAmount, minimumPayment){
        while(loanAmount > 0){
            loanAmount = loanAmount - minimumPayment;   
        }
    }
}]);