//load(helpers.js);
app.controller('DebtController', ['$scope',function($scope){
    $scope.noneSelected = true;
    $scope.snowballSelected = false;
    $scope.avalancheSelected = false;
    $scope.loans = [];
    //$scope.unsortedLoans = [];
    //$scope.isSorted = false;
    $scope.additionalMonthlyPayment = 0.00;
    $scope.allDebtsHidden = true;
    $scope.hiddenSchedule = true;
//    $scope.showSchedule = function(){
//        $scope.hiddenSchedule = !$scope.hiddenSchedule;  
//    };
    
    $scope.SwitchToAvalancheMethod = function(){
        $scope.noneSelected = false;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = true;
        $scope.GenerateSchedules();//$scope.OrderByChosenMethod();
    };
    
    $scope.SwitchToSnowballMethod = function(){
        $scope.noneSelected = false;
        $scope.snowballSelected = true;
        $scope.avalancheSelected = false;
        $scope.GenerateSchedules();//$scope.OrderByChosenMethod();
    };
    
    $scope.SwitchToNoMethod = function(){
        $scope.noneSelected = true;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = false;
        $scope.GenerateSchedules();//$scope.OrderByChosenMethod();
    };
//    $scope.SwitchPayoffMethod = function(event){
//        var currIndex = event.target.id;
//        If(currIndex == "avalanche"){
//            $scope.noMethodSelected = false;
//            $scope.snowballMethodSelected = false;
//            $scope.avalancheSelected = true;
//        }else if(currIndex == "snowball"){
//            $scope.noMethodSelected = false;
//            $scope.snowballMethodSelected = true;
//            $scope.avalancheSelected = true;
//        }else{
//            $scope.noMethodSelected = true;
//            $scope.snowballMethodSelected = false;
//            $scope.avalancheSelected = false;
//        }
//    };

    var loan = {
        index:0,
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
        //make the index the length
        additionalLoan.index = $scope.loans.length;
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
            $scope.allDebtsHidden = false;
            var loan;
            for(var i = 0; i < $scope.loans.length; i++){
                //alert($scope.loans[i].name);
                $scope.loans[i].schedule = $scope.Amortization($scope.loans[i]);
            }
            
            /*save the original order only after it is first entered.
            *also check for newly added debts
            */
//            if(!$scope.isSorted){
//                $scope.unsortedLoans = $scope.loans.slice(0);
//            }
            
            $scope.OrderByChosenMethod();
            //after schedules are set and the loans are sorted, apply the additional payments
            if($scope.additionalMonthlyPayment > 0.00){
                $scope.ApplyAdditionalPaymentsToLoans($scope.additionalMonthlyPayment);
            }
        }    
    }
    
//    $scope.ResetLoansToOriginalSpecs = function(){
//        
//        for(var i = 0; i < $scope.loans.length; i++){
//               
//        }
//    }
    
    $scope.OrderByChosenMethod = function(){
        if($scope.loans.length > 1){
            //TODO: REST LOANS TO ORIGINAL SPECS BEFORE SORTING
            //
            //
            //
            if($scope.avalancheSelected){
                $scope.loans.sort(function(a,b){return b.interestRate - a.interestRate}); 
                //$scope.isSorted = true;
            }else if($scope.snowballSelected){
                $scope.loans.sort(function(a,b){return a.principle - b.principle});  
                //$scope.isSorted = true;
            }else{
                $scope.loans.sort(function(a,b){return a.index - b.index});  
                //$scope.loans = $scope.unsortedLoans.slice(0);
                //$scope.isSorted = false;
            }
            //after sorting, go through each loan and apply the remainder of the previous loan's last month payment to the next loan in the same month
            $scope.CascadePaymentRemaindersToNext();
        }
    }
    
    $scope.CascadePaymentRemaindersToNext = function(){
        var addedPaymentForNextLoan = 0;
        var secondToLastPayment, lastPayment, difference, prevLoan, currentLoan, nextPaymentIndex, extraAvailableAmount;
        //start from second loan
        for(var i = 1; i < $scope.loans.length; i++){
            prevLoan = $scope.loans[i-1];
            currentLoan = $scope.loans[i];
            //secondToLastPayment = prevLoan.schedule[prevLoan.schedule.length - 2].paymentAmount;
            lastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
            //difference = Math.round(secondToLastPayment - lastPayment);
            //find when to roll over the leftover amount
            nextPaymentIndex = $scope.FindIndexOfObjectWithProperty(currentLoan.schedule, "date", prevLoan.schedule[prevLoan.schedule.length - 1].date);
            //find the total amount leftover from previous loans available to apply to current loans
            extraAvailableAmount = Math.round(($scope.FindSumOfPreviousPayments(i) + $scope.additionalMonthlyPayment) - lastPayment);
      
            if(extraAvailableAmount > 0){
                //apply the difference in total extra available money sent to the last payment of the previous loan to the payment 
                //in the current loan of the same month
                $scope.loans[i] = $scope.ApplyPaymentToLoan(extraAvailableAmount, currentLoan, nextPaymentIndex, nextPaymentIndex + 1); 
                //then apply the standard cascaded payment to the rest of the payments
                $scope.loans[i] = $scope.ApplyPaymentToLoan($scope.FindSumOfPreviousPayments(i), currentLoan, nextPaymentIndex + 1, currentLoan.schedule.length -1);   
            }else{
                //apply the total previous loan payment to the next loan at all indices after the previous loans are paid off
                $scope.loans[i] = $scope.ApplyPaymentToLoan($scope.FindSumOfPreviousPayments(i), currentLoan, nextPaymentIndex, currentLoan.schedule.length -1); 
            }
            
        }
    }
    
    //find the sum of the monthly payment amounts from all loans before the current one to cascade them
    $scope.FindSumOfPreviousPayments = function(currentLoanIndex){
        var sum = 0;
        var slicedLoans = $scope.loans.slice(0, currentLoanIndex);
        sum = slicedLoans.reduce(function(total,num){
            return {minimumMonthlyPayment: total.minimumMonthlyPayment + num.minimumMonthlyPayment};
        });
        return sum.minimumMonthlyPayment;
    }

    
    $scope.ApplyPaymentToLoan = function(amount, loan, startIndex, endIndex){
        var previousPaymentInterest, previousPaymentTotal, principle, currentPayment;
        for(var j = startIndex; j < endIndex; j++){
            if(j == 0){
                previousPaymentInterest = 0.00;
                previousPaymentTotal = 0.00;
                principle = loan.principle;
            }else{
                previousPaymentInterest = loan.schedule[j-1].currentInterestPaid;
                previousPaymentTotal = loan.schedule[j-1].currentPaidOverall;
                principle = loan.schedule[j-1].principleRemaining;
            }
            currentPayment = $scope.ApplyPayment(loan,loan.schedule[j], amount, previousPaymentInterest, previousPaymentTotal, principle);

            if(currentPayment.principleRemaining <= 0){
                currentPayment = $scope.ReconcilePaymentAfterPayoff(currentPayment);
                //if not at the end of the payment schedule yet, cut off the remaining payments
                if(j < loan.schedule.length){
                    loan.schedule.splice(j+1,loan.schedule.length);
                }  

                loan.schedule[j] = currentPayment;
                break;   
            }
            principle = currentPayment.principleRemaining;
            previousPaymentTotal += currentPayment.paymentAmount;
            previousPaymentInterest += currentPayment.towardInterest;
            loan.schedule[j] = currentPayment;
        }
        return loan;
    }
    
    $scope.ApplyAdditionalPaymentsToLoans = function(additional){
        var principle, previousPaymentTotal, previousInterestTotal, currentPayment, currentPaymentSchedule, nextExtraPaymentStartDate, startDateIndex, currentLoan;
        //start the additional payments on the first loan from the start date. all others will start the additional payments after each subsequent loan has been paid
        nextExtraPaymentStartDate = $scope.loans[0].schedule[0].date;
        for(var i = 0; i < $scope.loans.length; i++){
            //currentLoan = $scope.loans[i];
            previousPaymentTotal = 0.00;
            previousInterestTotal = 0.00;
            principle = currentLoan.principle;
            currentPaymentSchedule = currentLoan.schedule;
            startDateIndex = $scope.FindIndexOfObjectWithProperty(currentPaymentSchedule, "date", nextExtraPaymentStartDate);
//            for(var j = startDateIndex; j < currentPaymentSchedule.length; j++){
//                if(j == 0){
//                    previousInterestTotal = 0;//currentPaymentSchedule[j].currentInterestPaid;
//                    previousPaymentTotal = 0;//currentPaymentSchedule[j].currentPaidOverall;
//                    principle = currentLoan.principle;//currentPaymentSchedule[j].principleRemaining;
//                }else{
//                    previousInterestTotal = currentPaymentSchedule[j-1].currentInterestPaid;
//                    previousPaymentTotal = currentPaymentSchedule[j-1].currentPaidOverall;
//                    principle = currentPaymentSchedule[j-1].principleRemaining;
//                }
//                currentPayment = $scope.ApplyPayment(currentLoan,currentPaymentSchedule[j], additional, previousInterestTotal, previousPaymentTotal, principle);
//
//                if(currentPayment.principleRemaining <= 0){
//                    currentPayment = $scope.ReconcilePaymentAfterPayoff(currentPayment);
//                    //if not at the end of the payment schedule yet, cut off the remaining payments
//                    if(j < currentPaymentSchedule.length){
//                        $scope.loans[i].schedule.splice(j+1,currentPaymentSchedule.length);
//                    }  
//      
//                    $scope.loans[i].schedule[j] = currentPayment;
//                    break;   
//                }
//                principle = currentPayment.principleRemaining;
//                previousPaymentTotal += currentPayment.paymentAmount;
//                previousInterestTotal += currentPayment.towardInterest;
//                $scope.loans[i].schedule[j] = currentPayment;
//            }
            $scope.loans[i] = $scope.ApplyPaymentToLoan($scope.loans[i], additional, startDateIndex);
            //the next loan will begin the additional payments after the currentLoan's end month
            //TODO: calculate the extra payments that will go into the next loan
            nextExtraPaymentStartDate = $scope.loans[i].schedule[$scope.loans[i].schedule.length - 1].date;
        }
    }
    
    $scope.FindIndexOfObjectWithProperty = function(array, prop, val){
        for(var i = 0; i < array.length; i++){
            if(array[i][prop] === val ){
                return i;   
            }
        }
        return -1;
    }
    
    $scope.ResetLoans = function(){
        $scope.noneSelected = true;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = false;
        $scope.loans = [];
        $scope.unsortedLoans = [];
        $scope.totalMonthlyPayment = 0;
        $scope.additionalMonthlyPayment = 0;
        //$scope.isSorted = false;
        $scope.allDebtsHidden = true;
        $scope.hiddenSchedule = true; 
        $scope.Init();
    }

    $scope.ApplyPayment = function(loan, currentPayment, additional, prevInterest, prevPayment, principle){
        var monthlyInterestRate = (loan.interestRate/100) / 12;
        var interestRate = loan.interestRate;
        //var term = loan.term;
        //var totalMonthlyPayment = loan.minimumMonthlyPayment;
        
        currentPayment.paymentAmount = loan.minimumMonthlyPayment + additional;
        //$scope.totalPaid = $scope.totalPaid + currentPayment.paymentAmount;
        currentPayment.currentPaidOverall = prevPayment + currentPayment.paymentAmount;
        currentPayment.towardInterest = principle * monthlyInterestRate;
        //$scope.totalInterestPaid = $scope.totalInterestPaid + currentPayment.towardInterest;
        currentPayment.currentInterestPaid = prevInterest + currentPayment.towardInterest;
        currentPayment.towardPrinciple = currentPayment.paymentAmount - currentPayment.towardInterest;
        currentPayment.principleRemaining = principle - currentPayment.towardPrinciple;
        
        return currentPayment;
    }
    
    //subtract (add) the amount less than zero from the payment amount and recalculate
    $scope.ReconcilePaymentAfterPayoff = function(payment){
        payment.paymentAmount = payment.paymentAmount + payment.principleRemaining;
        payment.currentPaidOverall += payment.principleRemaining;
        payment.towardPrinciple = payment.paymentAmount - payment.towardInterest;
        payment.principleRemaining = 0;  
        return payment;
    }
    
    
    //on form, make total's minimum value be equal to minimumPayment field, but field is not required
    $scope.Amortization = function(loan){
            //alert(loan.principle + ' ' + loan.interestRate + ' ' + loan.term + ' ' + loan.minimumMonthlyPayment);
            var principle = loan.principle;
            var schedule = [];
            var currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() + 1);
            var previousPaymentTotal = 0.00;
            var previousInterestTotal = 0.00;
            var currentPayment;
            //if condition is (principle >= 0), it causes infinite loop
            while(principle >= 0.01){
                //console.log(principle);
                currentPayment = angular.copy(payment);
                currentPayment = $scope.ApplyPayment(loan, currentPayment, 0, previousInterestTotal, previousPaymentTotal, principle);
                currentPayment.date = formatDate(currentDate);
                if(currentPayment.principleRemaining < 0){
                    currentPayment = $scope.ReconcilePaymentAfterPayoff(currentPayment) 
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