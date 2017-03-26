app.directive('ddDebt', function(){
   return {
       restrict:'E',
       templateUrl:"ddDebt.html",
       link: function(scope, element, attrs){
            scope.showSchedule = function(){
                scope.hiddenSchedule = !scope.hiddenSchedule;  
            };
          
            scope.RetrieveTotalPaid = function(loan){
                //sum the payment amounts
                var sum = loan.schedule.reduce(function(total,num){
                    return {paymentAmount: total.paymentAmount + num.paymentAmount};
                });
                return sum.paymentAmount; 
            }

            scope.RetrievePayoffDate = function(loan){
                return loan.schedule[loan.schedule.length - 1].date;   
            }
      }

   };
});