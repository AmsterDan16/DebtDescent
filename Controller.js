app.controller('DebtController', ['$scope', function($scope){
    $scope.minimumMonthlyPayment = 0.00;
    $scope.numberOfMonthsTilPayoff = 0;
    $scope.initialPrinciple = 0;
    $scope.interestRate = 0;
    $scope.loanTerm = 0;
    $scope.minimumPayment = 0;
    $scope.totalMonthlyPayment;
    $scope.totalInterestPaid = 0;
    $scope.totalPaid = 0;
//    $scope.CreateAmoritizationSchedule = function(loanAmount, minimumPayment){
//        while(loanAmount > 0){
//            loanAmount = loanAmount - minimumPayment;   
//            $scope.numberOfMonthsTilPayoff += 1;
//        }
//    }
    $scope.loan = {
        principle:0,
        term:0,
        interestRate:0,
        schedule: []
    };

    var payment = {
        paymentAmount:0.00,
        principleRemaining:0.00,
        towardInterest:0.00,
        towardPrinciple:0.00,
        currentPaidOverall:0.00,
        currentInterestPaid:0.00,
        date: ""
    };

    $scope.schedule = [];
    $scope.loans = [];
    
    function CalcExponent(base, power){
        var result = 1;
        for(var i = 0; i < power; i++){
            result *= base;   
        }
        return result;
    }
    
    /*
        in: unformatted date object
        out: string in mmm yyyy format (e.g. Dec 2016)
    */
    function formatDate(unformattedDate){
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];  
        return months[unformattedDate.getMonth()].substring(0,3) + " " + unformattedDate.getFullYear(); 
    }
    
    $scope.CalculateMinimumPayment = function(){
        //payment = (monthlyInterest * initialLoan * (1 + monthlyInterest)^  
        var monthlyInterestRate = ($scope.interestRate/100) / 12;
        var numerator = monthlyInterestRate * $scope.initialPrinciple * CalcExponent((1 + monthlyInterestRate), $scope.loanTerm);
        //alert($scope.loanTerm);
        //$scope.minimumMonthlyPayment = $scope.interestRate * $scope.initialPrinciple * CalcExponent((1 + $scope.interestRate), $scope.loanTerm);
        $scope.minimumMonthlyPayment = numerator / (CalcExponent((1 + monthlyInterestRate), $scope.loanTerm) - 1);
    };

    //on form, make total's minimum value be equal to minimumPayment field, but field is not required
    $scope.Amortization = function(principle, interestRate, term, totalMonthlyPayment){
            $scope.schedule = [];
            if(totalMonthlyPayment === undefined){
                totalMonthlyPayment = $scope.minimumMonthlyPayment;
            }
            var monthlyInterestRate = (interestRate/100) / 12;
            var currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() + 1);
            var previousPaymentTotal = 0.00;
            var previousInterestTotal = 0.00;
            //if condition is (principle >= 0), it causes infinite loop
            while(principle >= 0.01){
                console.log(principle);
                var currentPayment = angular.copy(payment);
                currentPayment.paymentAmount = totalMonthlyPayment;
                //$scope.totalPaid = $scope.totalPaid + currentPayment.paymentAmount;
                currentPayment.currentPaidOverall = previousPaymentTotal + currentPayment.paymentAmount;
                currentPayment.towardInterest = principle * monthlyInterestRate;
                //$scope.totalInterestPaid = $scope.totalInterestPaid + currentPayment.towardInterest;
                currentPayment.currentInterestPaid = previousInterestTotal + currentPayment.towardInterest;
                currentPayment.towardPrinciple = currentPayment.paymentAmount - currentPayment.towardInterest;
                currentPayment.principleRemaining = principle - currentPayment.towardPrinciple;
                currentPayment.date = formatDate(currentDate);
                if(currentPayment.principleRemaining < 0){
                    //subtract (add) the amount less than zero from the payment amount and recalculate
                    currentPayment.paymentAmount = currentPayment.paymentAmount + currentPayment.principleRemaining;
                    currentPayment.currentPaidOverall += currentPayment.principleRemaining;
                    currentPayment.towardPrinciple = currentPayment.paymentAmount - currentPayment.towardInterest;
                    currentPayment.principleRemaining = 0;
                }

                principle = currentPayment.principleRemaining;
                previousPaymentTotal += currentPayment.paymentAmount;
                previousInterestTotal += currentPayment.towardInterest;
                currentDate.setMonth(currentDate.getMonth() + 1);//new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                $scope.schedule.push(currentPayment);
            }

    };
}]);