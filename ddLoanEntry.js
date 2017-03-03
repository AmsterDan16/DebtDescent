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
                var numerator;
                var monthlyInterestRate = (loan.interestRate/100) / 12;
                if(monthlyInterestRate <= 0){
                    loan.minimumMonthlyPayment = loan.principle / loan.term;
                }else{
                    numerator = monthlyInterestRate * loan.principle * CalcExponent((1 + monthlyInterestRate), loan.term);
                    loan.minimumMonthlyPayment = numerator / (CalcExponent((1 + monthlyInterestRate), loan.term) - 1);
                }
                
            };
            
            /*
                in: loan at current index
                out: 
                purpose: remove loan at selected index
            */
            scope.RemoveLoan = function(loan){
                var index = scope.loans.indexOf(loan);
                scope.loans.splice(index, 1);  
            };
            
            /*
                in: base int, and power int
                out: base raised to the power input
                purpose: calculate and return base^power
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