app.controller('DebtController', ['$scope', function($scope){
    $scope.monthlyPayment = 0;
    $scope.numberOfMonthsTilPayoff = 0;
    $scope.initialPrinciple = 0;
    $scope.interestRate = 0;
    $scope.term = 0;
    $scope.minimumPayment = 0;
    $scope.totalPayment;
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
    }

    var payment = {
        paymentAmount:0.00,
        principleRemaining:0.00,
        towardInterest:0.00,
        towardPrinciple:0.00
        //,date: Date(month, year)
    };

    $scope.schedule = [];

    //on form, make total's minimum value be equal to minimumPayment field, but field is not required
    $scope.Amortization = function(principle, interestRate, term, minimumPayment, totalPayment){
            if(totalPayment === undefined){
                totalPayment = minimumPayment;
            }
            var monthlyInterestRate = (interestRate/100) / 12;
            //alert("monthly interest" + monthlyInterestRate);
            var currentDate = Date();//date.currentdate(mm/yyyy);
            //alert($scope.schedule.length);
            while(principle > 0){
                //alert(principle);
                var currentPayment = angular.copy(payment);
                currentPayment.paymentAmount = totalPayment;
                //alert("payment:" + currentPayment.paymentAmount);
                currentPayment.towardInterest = principle * monthlyInterestRate;
                //alert("towardinterest:" + currentPayment.towardInterest);
                currentPayment.towardPrinciple = totalPayment - currentPayment.towardInterest;
                //alert("towardprinciple:" + currentPayment.towardPrinciple);
                currentPayment.principleRemaining = principle - currentPayment.towardPrinciple;
                if(currentPayment.principleRemaining < 0){
                    //alert("<0");
                    //subtract (add) the amount less than zero from the payment amount and recalculate
                    currentPayment.paymentAmount = currentPayment.paymentAmount + currentPayment.principleRemaining;
                    //alert(currentPayment.paymentAmount);
                    //break;
                    currentPayment.towardPrinciple = currentPayment.paymentAmount - currentPayment.towardInterest;
                    //alert(currentPayment.towardPrinciple);
                    currentPayment.principleRemaining = 0;
                }
                //currentPayment.date = currentDate;
                //currentDate += 1;
                principle = currentPayment.principleRemaining;
                //alert(principle);
                $scope.schedule.push(currentPayment);
            }
            //alert($scope.schedule.length);

    }
}]);