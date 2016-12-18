app.directive('ddLoanEntry', function(){
    return {
        restrict:'E',
        scope: {
            loan: '=loan',
            loans: '=loans'
        },
        //replace:true,
        templateUrl:'ddLoanEntry.html',
        link: function(scope, element, attrs){
            $scope.CalculateMinimumPayment = function(){
                var monthlyInterestRate = ($scope.interestRate/100) / 12;
                var numerator = monthlyInterestRate * $scope.initialPrinciple * CalcExponent((1 + monthlyInterestRate), $scope.loanTerm);
                $scope.loan.minimumMonthlyPayment = numerator / (CalcExponent((1 + monthlyInterestRate), $scope.loanTerm) - 1);
            };   
        }
    };
});