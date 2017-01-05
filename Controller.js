//load(helpers.js);
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
    $scope.schedule = [];
    $scope.loans = [];
    $scope.hiddenSchedule = false;
    $scope.showSchedule = function(){
      $scope.hiddenSchedule = !$scope.hiddenSchedule;  
    };

    var loan = {
        name:"",
        principle:0.00,
        term:0,
        interestRate:0.00,
        minimumMonthlyPayment:0.00,
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
    
    $scope.Init = function(){
        var firstLoan = angular.copy(loan); 
        $scope.loans.push(firstLoan);
    }
    
    $scope.AddLoan = function(){
        var additionalLoan = angular.copy(loan);
        $scope.loans.push(additionalLoan);
    }
    /*
        in: unformatted date object
        out: string in mmm yyyy format (e.g. Dec 2016)
    */
    function formatDate(unformattedDate){
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];  
        return months[unformattedDate.getMonth()].substring(0,3) + " " + unformattedDate.getFullYear(); 
    }

    
    $scope.GenerateSchedules = function(){
        if($scope.loans.length == 0){
            alert("No debt found! Please enter 1 or more debts.");
        }else{
            //alert($scope.loans.length);
            var loan;
             for(var i = 0; i < $scope.loans.length; i++){
                 //loan = $scope.loans[i];
                 //alert(loan.minimumMonthlyPayment);
                 $scope.loans[i].schedule = $scope.Amortization($scope.loans[i]);
                 //alert($scope.loans[i].schedule.length);
             }
            //TESTING
//             for(var i = 0; i < $scope.loans.length; i++){
//                var schedule = $scope.loans[i].schedule;
//                for(var j = 0; j < schedule.length; j++){
//                    alert(schedule[j].principleRemaining);   
//                }
//             }
            //TESTING
        }    
    }

    //on form, make total's minimum value be equal to minimumPayment field, but field is not required
    $scope.Amortization = function(loan){
            //alert(loan.principle + ' ' + loan.interestRate + ' ' + loan.term + ' ' + loan.minimumMonthlyPayment);
            var principle = loan.principle;
            var interestRate = loan.interestRate;
            var term = loan.term;
            var totalMonthlyPayment = loan.minimumMonthlyPayment;
            var schedule = [];//$scope.schedule = [];
//            if(totalMonthlyPayment === undefined){
//                totalMonthlyPayment = $scope.minimumMonthlyPayment;
//            }
            var monthlyInterestRate = (interestRate/100) / 12;
            var currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() + 1);
            var previousPaymentTotal = 0.00;
            var previousInterestTotal = 0.00;
            //if condition is (principle >= 0), it causes infinite loop
            while(principle >= 0.01){
                //console.log(principle);
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
                schedule.push(currentPayment);
            }
        return schedule;
    };
    $scope.Init();
}]);