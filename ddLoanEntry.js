//load(helpers.js);
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
            scope.CalculateMinimumPayment = function(loan){
                alert(loan.interestRate);
                var monthlyInterestRate = (loan.interestRate/100) / 12;
                var numerator = monthlyInterestRate * loan.initialPrinciple * CalcExponent((1 + monthlyInterestRate), loan.loanTerm);
                loan.minimumMonthlyPayment = numerator / (CalcExponent((1 + monthlyInterestRate), loan.loanTerm) - 1);
            };
            
            scope.RemoveLoan(loan){
                var index = scope.loans.indexOf(loan);
                scope.loans.splice(index, 1);  
            };
            
            /*
                in: base int, and power int
                out: base raised to the power input
            */
            function CalcExponent(base, power){
                var result = 1;
                for(var i = 0; i < power; i++){
                    result *= base;   
                }
                return result;
            }

        }
    };
});