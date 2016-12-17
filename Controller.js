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
        currentInterestPaid:0.00
        //,date: Date(month, year)
    };

    $scope.schedule = [];
    
    $scope.CalcExponent = function(base, power){
        var result = 1;
        for(var i = 0; i < power; i++){
            result *= base;   
        }
        return result;
    };
    
    $scope.CalculateMinimumPayment = function(){
        //payment = (monthlyInterest * initialLoan * (1 + monthlyInterest)^  
        var numerator = $scope.interestRate * $scope.initialPrinciple * CalcExponent((1 + $scope.interestRate), $scope.loanTerm);
        //alert(numerator);
        $scope.minimumMonthlyPayment = numerator / (CalcExponent((1 + $scope.interestRate), $scope.loanTerm) - 1);
    };

    //on form, make total's minimum value be equal to minimumPayment field, but field is not required
    $scope.Amortization = function(principle, interestRate, term, minimumPayment, totalMonthlyPayment){
            if(totalMonthlyPayment === undefined){
                totalMonthlyPayment = minimumPayment;
            }
            var monthlyInterestRate = (interestRate/100) / 12;
            var currentDate = Date();//date.currentdate(mm/yyyy);
            //alert($scope.schedule.length);
            var previousPaymentTotal = 0.00;
            var previousInterestTotal = 0.00;
            while(principle > 0){
                var currentPayment = angular.copy(payment);
                currentPayment.paymentAmount = totalMonthlyPayment;
                //$scope.totalPaid = $scope.totalPaid + currentPayment.paymentAmount;
                currentPayment.currentPaidOverall = previousPaymentTotal + currentPayment.paymentAmount;
                currentPayment.towardInterest = principle * monthlyInterestRate;
                //$scope.totalInterestPaid = $scope.totalInterestPaid + currentPayment.towardInterest;
                currentPayment.currentInterestPaid = previousInterestTotal + currentPayment.towardInterest;
                currentPayment.towardPrinciple = totalMonthlyPayment - currentPayment.towardInterest;
                currentPayment.principleRemaining = principle - currentPayment.towardPrinciple;
                if(currentPayment.principleRemaining < 0){
                    //subtract (add) the amount less than zero from the payment amount and recalculate
                    currentPayment.paymentAmount = currentPayment.paymentAmount + currentPayment.principleRemaining;
                    //$scope.totalPaid = $scope.totalPaid + currentPayment.principleRemaining;
                    currentPayment.currentPaidOverall += currentPayment.principleRemaining;
                    currentPayment.towardPrinciple = currentPayment.paymentAmount - currentPayment.towardInterest;
                    currentPayment.principleRemaining = 0;
                }
                //currentPayment.date = currentDate;
                //currentDate += 1;
                principle = currentPayment.principleRemaining;
                previousPaymentTotal += currentPayment.paymentAmount;
                previousInterestTotal += currentPayment.towardInterest;
                //alert(principle);
                $scope.schedule.push(currentPayment);
            }
            //alert($scope.schedule.length);

    };
}]);